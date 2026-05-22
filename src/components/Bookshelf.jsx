import { audiobooks } from '../data/audiobooks'

const GRADIENTS = [
  'from-purple-900 to-indigo-950',
  'from-blue-900 to-slate-950',
  'from-indigo-900 to-violet-950',
  'from-slate-800 to-blue-950',
  'from-violet-900 to-slate-950',
  'from-blue-800 to-indigo-950',
]

function HeadphonesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
      <path d="M12 1C7.03 1 3 5.03 3 10v4c0 1.1.9 2 2 2h1v-5H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-1v5h1c1.1 0 2-.9 2-2v-4c0-4.97-4.03-9-9-9z" />
    </svg>
  )
}

function BookCard({ book, onSelect }) {
  const gradient = GRADIENTS[book.id % GRADIENTS.length]
  return (
    <div onClick={() => onSelect(book)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div
        className={`bg-gradient-to-br ${gradient}`}
        style={{
          aspectRatio: '2/3', borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(120,80,255,0.25)'
          e.currentTarget.style.transform = 'scale(1.03)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {book.cover
          ? <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <HeadphonesIcon />
        }
      </div>
      <div style={{ padding: '0 2px' }}>
        <p style={{
          color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1.3, margin: 0,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>{book.title}</p>
        <p style={{
          color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: '2px 0 0', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{book.author}</p>
      </div>
    </div>
  )
}

export default function Bookshelf({ onSelect, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(5, 5, 10, 0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          overflowY: 'auto', padding: '2rem 2rem 8rem', boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <p style={{
            color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0,
          }}>My Library</p>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem 0.75rem' }}>
          {audiobooks.map(book => (
            <BookCard key={book.id} book={book} onSelect={book => { onSelect(book); onClose() }} />
          ))}
        </div>
      </div>
    </div>
  )
}
