import { afterEach, describe, expect, it, vi } from 'vitest'

const sendMock = vi.fn(async () => ({ data: { id: 'email-id' }, error: null }))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock }
  }
}))

afterEach(() => {
  sendMock.mockClear()
  vi.restoreAllMocks()
})

describe('sendChooserNotification', () => {
  it('sends an email with the correct subject and recipient', async () => {
    const { sendChooserNotification } = await import('@/lib/email')

    await sendChooserNotification({
      toEmail: 'joao@example.com',
      toName: 'João',
      groupName: 'Cinephiles',
      weekStart: new Date('2026-06-22T03:00:00.000Z'),
      weekEnd: new Date('2026-06-29T03:00:00.000Z'),
    })

    expect(sendMock).toHaveBeenCalledOnce()
    const [payload] = sendMock.mock.calls[0]
    expect(payload.to).toBe('joao@example.com')
    expect(payload.subject).toContain('Cinephiles')
    expect(payload.html).toContain('João')
    expect(payload.html).toContain('Cinephiles')
  })

  it('sends from the notify.staciotech.com domain', async () => {
    const { sendChooserNotification } = await import('@/lib/email')

    await sendChooserNotification({
      toEmail: 'test@example.com',
      toName: 'Test',
      groupName: 'Grupo',
      weekStart: new Date('2026-06-22T03:00:00.000Z'),
      weekEnd: new Date('2026-06-29T03:00:00.000Z'),
    })

    const [payload] = sendMock.mock.calls[0]
    expect(payload.from).toContain('notify.staciotech.com')
  })
})

