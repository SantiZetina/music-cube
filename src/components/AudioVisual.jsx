import { Shader, FlowingGradient } from 'shaders/react'

export default function AudioVisual({ isPlaying, book }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Shader style={{ position: 'absolute', inset: 0 }}>
        <FlowingGradient
          colorA="#080010"
          colorB="#1a0840"
          colorC="#0d1a3a"
          colorD="#180828"
          speed={isPlaying ? 0.8 : 0.2}
          distortion={0.4}
          colorSpace="oklch"
        />
      </Shader>

      {book && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          paddingBottom: '8rem',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
        }}>
          <img
            src={book.cover}
            alt={book.title}
            style={{
              width: 'min(200px, 55vw)',
              aspectRatio: '2 / 3',
              objectFit: 'cover',
              borderRadius: '10px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.95rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 600,
              margin: 0,
              lineHeight: 1.3,
            }}>{book.title}</p>
            <p style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '0.8rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              margin: '0.25rem 0 0',
            }}>{book.author}</p>
          </div>
        </div>
      )}
    </div>
  )
}
