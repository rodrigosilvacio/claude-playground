export const config = { maxDuration: 30 };

// Chave publishable do Supabase: pública por natureza, protegida pela RLS da
// tabela (apenas INSERT anônimo). Fica aqui só porque a gravação passou para o
// servidor; não há segredo envolvido.
const SUPABASE_URL = 'https://xtrvojnauvkkterogrst.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JmhdMN8S7lSpCeaJANw_lQ_RRwZ2_OT';
const TABLE = 'bebidas_suporte_tickets';

// Sem domínio verificado, o Resend só aceita este remetente.
const FROM = process.env.RESEND_FROM || 'Suporte <onboarding@resend.dev>';

const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function validate(body) {
  const nome = String(body?.nome ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const mensagem = String(body?.mensagem ?? '').trim();

  if (!nome || !email || !mensagem) return { erro: 'Preencha todos os campos.' };
  // Os limites espelham os CHECKs da tabela, para devolver erro legível em vez
  // de estourar uma constraint do Postgres.
  if (nome.length > 200) return { erro: 'Nome muito longo (máximo 200 caracteres).' };
  if (email.length > 320 || email.indexOf('@') < 1) return { erro: 'E-mail inválido.' };
  if (mensagem.length > 5000) return { erro: 'Descrição muito longa (máximo 5000 caracteres).' };

  return { ticket: { nome, email, mensagem } };
}

async function enviarEmail(payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.message || 'HTTP ' + res.status);
  }
  return res.json();
}

async function notificar(ticket) {
  const status = { equipe: false, autor: false, erros: [] };

  if (!process.env.RESEND_API_KEY) {
    status.erros.push('RESEND_API_KEY não configurada');
    return status;
  }

  const destino = process.env.SUPPORT_EMAIL;
  const corpo =
    '<p><strong>Nome:</strong> ' + esc(ticket.nome) + '</p>' +
    '<p><strong>E-mail:</strong> ' + esc(ticket.email) + '</p>' +
    '<p><strong>Descrição:</strong><br>' + esc(ticket.mensagem).replace(/\n/g, '<br>') + '</p>';

  if (destino) {
    try {
      await enviarEmail({
        from: FROM,
        to: [destino],
        reply_to: ticket.email,
        subject: 'Novo ticket de suporte — ' + ticket.nome,
        html: corpo
      });
      status.equipe = true;
    } catch (e) {
      status.erros.push('aviso à equipe: ' + e.message);
    }
  } else {
    status.erros.push('SUPPORT_EMAIL não configurada');
  }

  // Enquanto o domínio não estiver verificado no Resend, este envio falha para
  // qualquer endereço que não seja o dono da conta. É esperado, e não invalida
  // o ticket.
  try {
    await enviarEmail({
      from: FROM,
      to: [ticket.email],
      subject: 'Recebemos seu chamado',
      html: '<p>Olá, ' + esc(ticket.nome) + '.</p>' +
        '<p>Seu ticket foi endereçado e já está com a nossa equipe. ' +
        'Respondemos neste mesmo e-mail.</p>' +
        '<hr><p><em>Sua mensagem:</em><br>' +
        esc(ticket.mensagem).replace(/\n/g, '<br>') + '</p>'
    });
    status.autor = true;
  } catch (e) {
    status.erros.push('confirmação ao autor: ' + e.message);
  }

  return status;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { erro, ticket } = validate(req.body);
  if (erro) return res.status(400).json({ error: erro });

  // 1. Gravar. Se isto falhar, não há ticket e nada é notificado.
  try {
    const gravou = await fetch(SUPABASE_URL + '/rest/v1/' + TABLE, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(ticket)
    });
    if (!gravou.ok) {
      const detail = await gravou.json().catch(() => ({}));
      throw new Error(detail.message || 'HTTP ' + gravou.status);
    }
  } catch (e) {
    console.error('Falha ao gravar ticket:', e);
    return res.status(502).json({ error: 'Não foi possível registrar o ticket.' });
  }

  // 2. Notificar. O ticket já está salvo, então falha de e-mail não vira erro
  // para quem preencheu o formulário — apenas fica registrada no log.
  const email = await notificar(ticket);
  if (email.erros.length) console.warn('Ticket gravado, e-mail parcial:', email.erros);

  return res.status(200).json({ ok: true, email });
}
