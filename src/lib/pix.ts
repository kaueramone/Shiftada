// Gerador de payload PIX estático (EMV/QR Code)
// Ref: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf

function crc16(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

function tlv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, '0')}${value}`
}

export function generatePixPayload(
  pixKey: string,
  name: string,
  city: string,
  amount?: number
): string {
  const merchantInfo =
    tlv('00', 'BR.GOV.BCB.PIX') +
    tlv('01', pixKey)

  const additionalData = tlv('05', '***')

  let payload =
    tlv('00', '01') +
    tlv('26', merchantInfo) +
    tlv('52', '0000') +
    tlv('53', '986') +
    (amount ? tlv('54', amount.toFixed(2)) : '') +
    tlv('58', 'BR') +
    tlv('59', name.slice(0, 25)) +
    tlv('60', city.slice(0, 15)) +
    tlv('62', additionalData) +
    '6304'

  return payload + crc16(payload)
}
