import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Beckflix <noreply@notify.staciotech.com>'

export async function sendChooserNotification({
  toEmail,
  toName,
  groupName,
  weekStart,
  weekEnd,
}: {
  toEmail: string
  toName: string
  groupName: string
  weekStart: Date
  weekEnd: Date
}) {
  const dateFormat = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
  })

  const from = dateFormat.format(weekStart)
  const to = dateFormat.format(new Date(weekEnd.getTime() - 1))

  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `🎬 Você foi sorteado no grupo "${groupName}"!`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f1a;color:#e2e8f0;padding:32px;border-radius:16px">
        <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.3em;color:#a78bfa;margin:0 0 8px">Beckflix</p>
        <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 16px">É a sua vez, ${toName}!</h1>
        <p style="color:#94a3b8;margin:0 0 16px">
          Você foi sorteado para escolher o filme desta semana no grupo
          <strong style="color:#fff">${groupName}</strong>.
        </p>
        <div style="background:#ffffff0a;border:1px solid #ffffff1a;border-radius:12px;padding:16px;margin:0 0 24px">
          <p style="margin:0;font-size:14px;color:#94a3b8">Período</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:600;color:#fff">${from} – ${to}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
           style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:600;font-size:15px">
          Escolher o filme
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#475569">
          Você está recebendo este email porque é membro do Beckflix.
        </p>
      </div>
    `,
  })
}

export async function sendRatingNotification({
  toEmail,
  toName,
  raterName,
  movieTitle,
  stars,
  groupName,
  groupId,
  recommendationId,
}: {
  toEmail: string
  toName: string
  raterName: string
  movieTitle: string
  stars: number
  groupName: string
  groupId: string
  recommendationId: string
}) {
  await resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: `⭐ ${raterName} avaliou "${movieTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0f0f1a;color:#e2e8f0;padding:32px;border-radius:16px">
        <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.3em;color:#a78bfa;margin:0 0 8px">Beckflix</p>
        <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0 0 16px">Nova avaliação, ${toName}!</h1>
        <p style="color:#94a3b8;margin:0 0 16px">
          <strong style="color:#fff">${raterName}</strong> avaliou o filme
          <strong style="color:#fff">${movieTitle}</strong> no grupo
          <strong style="color:#fff">${groupName}</strong> com
          <strong style="color:#fcd34d">${'⭐'.repeat(stars)} (${stars}/5)</strong>.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://beckflix.vercel.app'}/groups/${groupId}/movies/${recommendationId}"
           style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:600;font-size:15px">
          Ver avaliações
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#475569">
          Você está recebendo este email porque é membro do Beckflix.
        </p>
      </div>
    `,
  })
}
