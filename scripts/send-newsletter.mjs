import { Resend } from 'resend'
import * as dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Beckflix <noreply@notify.staciotech.com>'
const APP_URL = 'https://beckflix.vercel.app'

// Destinatários — altere antes de enviar para todos
const recipients = [
  { email: 'ytrapha@hotmail.com', name: 'Raphael' },
]

const html = `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0f0f1a;color:#e2e8f0;padding:32px;border-radius:16px">
  <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.3em;color:#a78bfa;margin:0 0 8px">Beckflix</p>
  <h1 style="font-size:26px;font-weight:700;color:#fff;margin:0 0 8px">Novidades chegaram 🎬</h1>
  <p style="color:#94a3b8;margin:0 0 28px;font-size:15px">
    Acabamos de lançar a versão <strong style="color:#fff">1.1.0</strong> com várias melhorias. Confira o que é novo:
  </p>

  <!-- Feature 1 -->
  <div style="border-left:3px solid #7c3aed;padding-left:16px;margin-bottom:20px">
    <p style="margin:0 0 4px;font-weight:700;color:#fff;font-size:15px">🎥 Trailer nos filmes</p>
    <p style="margin:0;color:#94a3b8;font-size:14px">
      Na página de cada filme do grupo agora tem o trailer oficial incorporado — sem sair do app.
    </p>
  </div>

  <!-- Feature 2 -->
  <div style="border-left:3px solid #7c3aed;padding-left:16px;margin-bottom:20px">
    <p style="margin:0 0 4px;font-weight:700;color:#fff;font-size:15px">🎠 Clique nos filmes do carrossel</p>
    <p style="margin:0;color:#94a3b8;font-size:14px">
      Os filmes em destaque no início do dashboard agora abrem um modal com sinopse, gêneros e trailer ao clicar.
    </p>
  </div>

  <!-- Feature 3 -->
  <div style="border-left:3px solid #7c3aed;padding-left:16px;margin-bottom:20px">
    <p style="margin:0 0 4px;font-weight:700;color:#fff;font-size:15px">🚪 Sair do grupo</p>
    <p style="margin:0;color:#94a3b8;font-size:14px">
      Membros agora podem sair de um grupo quando quiserem, diretamente na página do grupo.
    </p>
  </div>

  <!-- Feature 4 -->
  <div style="border-left:3px solid #7c3aed;padding-left:16px;margin-bottom:20px">
    <p style="margin:0 0 4px;font-weight:700;color:#fff;font-size:15px">🛡️ Remover membro (dono)</p>
    <p style="margin:0;color:#94a3b8;font-size:14px">
      Donos do grupo podem remover membros diretamente na lista de participantes.
    </p>
  </div>

  <!-- Feature 5 -->
  <div style="border-left:3px solid #7c3aed;padding-left:16px;margin-bottom:20px">
    <p style="margin:0 0 4px;font-weight:700;color:#fff;font-size:15px">👑 Transferir administração</p>
    <p style="margin:0;color:#94a3b8;font-size:14px">
      Donos podem transferir a administração do grupo para outro membro nas configurações.
    </p>
  </div>

  <!-- Feature 6 -->
  <div style="border-left:3px solid #7c3aed;padding-left:16px;margin-bottom:20px">
    <p style="margin:0 0 4px;font-weight:700;color:#fff;font-size:15px">🔑 Esqueci a senha</p>
    <p style="margin:0;color:#94a3b8;font-size:14px">
      Link "Esqueci minha senha" disponível na tela de login para recuperação por e-mail.
    </p>
  </div>

  <!-- Feature 7 -->
  <div style="border-left:3px solid #7c3aed;padding-left:16px;margin-bottom:20px">
    <p style="margin:0 0 4px;font-weight:700;color:#fff;font-size:15px">⭐ Notificação de avaliação</p>
    <p style="margin:0;color:#94a3b8;font-size:14px">
      Quem indicou o filme agora recebe um e-mail quando um membro avalia pela primeira vez.
    </p>
  </div>

  <a href="${APP_URL}/dashboard"
     style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:600;font-size:15px;margin-top:8px">
    Abrir o Beckflix
  </a>

  <p style="margin:28px 0 0;font-size:12px;color:#475569">
    Você está recebendo este e-mail porque tem uma conta no Beckflix.<br>
    <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none">beckflix.vercel.app</a>
  </p>
</div>
`

for (const recipient of recipients) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: recipient.email,
    subject: '🎬 Beckflix v1.1.0 — Novidades: trailers, sair do grupo e mais!',
    html,
  })

  if (error) {
    console.error(`❌ Erro ao enviar para ${recipient.email}:`, error)
  } else {
    console.log(`✅ Enviado para ${recipient.email} (id: ${data.id})`)
  }
}
