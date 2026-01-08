import { ImageResponse } from 'next/og'

export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#4B0082',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E6E6FA',
          borderRadius: 8,
          fontWeight: 'bolder',
        }}
      >
        N
      </div>
    ),
    {
      ...size,
    }
  )
}
