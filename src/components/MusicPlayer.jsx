import { useRef, useState, useEffect } from 'react'
import '../App.css'

const iconBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.8)',
  cursor: 'pointer',
  borderRadius: '50%',
  padding: 0,
  flexShrink: 0,
}

const timeStyle = {
  color: 'rgba(255,255,255,0.45)',
  fontSize: '0.7rem',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  letterSpacing: '0.04em',
  userSelect: 'none',
  flexShrink: 0,
  minWidth: '2.5ch',
  fontVariantNumeric: 'tabular-nums',
}

function fmt(s) {
  if (!isFinite(s) || isNaN(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function SpeakerIcon({ volume }) {
  if (volume === 0) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
  if (volume <= 0.5) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
      <path d="M15.54,8.46a5,5,0,0,1,0,7.07" />
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
      <path d="M19.07,4.93a10,10,0,0,1,0,14.14" />
      <path d="M15.54,8.46a5,5,0,0,1,0,7.07" />
    </svg>
  )
}

function SkipIcon({ forward }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      {forward ? (
        <>
          <path d="M18 13a6 6 0 1 1-6-6v3l4-4-4-4v3a8 8 0 1 0 8 8h-2z" opacity="0.9" />
          <text x="12" y="15" textAnchor="middle" fontSize="5.5" fontFamily="system-ui" fontWeight="700" fill="rgba(255,255,255,0.9)">30</text>
        </>
      ) : (
        <>
          <path d="M6 13a6 6 0 1 0 6-6v3l-4-4 4-4v3a8 8 0 1 1-8 8h2z" opacity="0.9" />
          <text x="12" y="15" textAnchor="middle" fontSize="5.5" fontFamily="system-ui" fontWeight="700" fill="rgba(255,255,255,0.9)">30</text>
        </>
      )}
    </svg>
  )
}

export default function MusicPlayer({
  isPlaying, trackName, volume, currentTime, duration, error,
  onFileLoad, onPlayPause, onVolumeChange, onSeek, onSkip, onOpenLibrary,
}) {
  const fileInputRef = useRef(null)
  const seekBarRef = useRef(null)
  const [showVolume, setShowVolume] = useState(false)
  const volumeWrapRef = useRef(null)
  const isDragging = useRef(false)

  useEffect(() => {
    if (!showVolume) return
    function onPointerDown(e) {
      if (volumeWrapRef.current && !volumeWrapRef.current.contains(e.target)) {
        setShowVolume(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [showVolume])

  useEffect(() => {
    function getClientX(e) {
      return e.touches ? e.touches[0].clientX : e.clientX
    }
    function seekFromEvent(e) {
      if (!isDragging.current || !duration || !seekBarRef.current) return
      const rect = seekBarRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (getClientX(e) - rect.left) / rect.width))
      onSeek(ratio * duration)
    }
    function onUp() { isDragging.current = false }
    document.addEventListener('mousemove', seekFromEvent)
    document.addEventListener('touchmove', seekFromEvent, { passive: true })
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', seekFromEvent)
      document.removeEventListener('touchmove', seekFromEvent)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchend', onUp)
    }
  }, [duration, onSeek])

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) onFileLoad(file)
    e.target.value = ''
  }

  function handleSeekDown(e) {
    if (!duration || !seekBarRef.current) return
    isDragging.current = true
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const rect = seekBarRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    onSeek(ratio * duration)
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0
  const volBg = `linear-gradient(to right, rgba(255,255,255,0.85) ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '0.75rem 1.25rem',
      background: 'rgba(15, 15, 20, 0.75)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      width: 'min(420px, 90vw)',
      boxSizing: 'border-box',
    }}>

      {/* Error row */}
      {error && (
        <div style={{
          color: 'rgba(255, 100, 100, 0.9)',
          fontSize: '0.7rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '0.02em',
          padding: '0.25rem 0',
          userSelect: 'text',
        }}>
          {error}
        </div>
      )}

      {/* Progress row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={timeStyle}>{fmt(currentTime)}</span>

        <div
          ref={seekBarRef}
          onMouseDown={handleSeekDown}
          onTouchStart={handleSeekDown}
          style={{
            flex: 1,
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            cursor: duration ? 'pointer' : 'default',
            position: 'relative',
            touchAction: 'none',
          }}
        >
          <div style={{
            width: '100%',
            height: '2px',
            borderRadius: '9999px',
            background: `linear-gradient(to right, rgba(255,255,255,0.7) ${pct}%, rgba(255,255,255,0.15) ${pct}%)`,
          }} />
          <div style={{
            position: 'absolute',
            left: `${pct}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 1px 6px rgba(0,0,0,0.4)',
            pointerEvents: 'none',
            opacity: duration ? 1 : 0.3,
            transition: isDragging.current ? 'none' : 'left 0.1s',
          }} />
        </div>

        <span style={{ ...timeStyle, textAlign: 'right' }}>{fmt(duration)}</span>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <button onClick={onOpenLibrary} style={iconBtn} title="Open library">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        <button onClick={() => fileInputRef.current.click()} style={iconBtn} title="Load file">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </button>

        <button
          onClick={() => onSkip(-30)}
          disabled={!trackName}
          style={{ ...iconBtn, opacity: trackName ? 1 : 0.3, cursor: trackName ? 'pointer' : 'default' }}
          title="Back 30s"
        >
          <SkipIcon forward={false} />
        </button>

        <button
          onClick={onPlayPause}
          disabled={!trackName}
          style={{
            ...iconBtn,
            width: '2.5rem',
            height: '2.5rem',
            background: trackName ? 'rgba(255,255,255,0.12)' : 'transparent',
            borderRadius: '50%',
            opacity: trackName ? 1 : 0.35,
            cursor: trackName ? 'pointer' : 'default',
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        <button
          onClick={() => onSkip(30)}
          disabled={!trackName}
          style={{ ...iconBtn, opacity: trackName ? 1 : 0.3, cursor: trackName ? 'pointer' : 'default' }}
          title="Forward 30s"
        >
          <SkipIcon forward={true} />
        </button>

        <span style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.8125rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: '0.02em',
          userSelect: 'none',
        }}>
          {trackName ?? 'No track loaded'}
        </span>

        <div style={{ width: '1px', height: '1.25rem', background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

        <div ref={volumeWrapRef} style={{ position: 'relative', flexShrink: 0 }}>
          {showVolume && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 0.75rem)',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.6rem 1rem',
              background: 'rgba(255, 255, 255, 0.07)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '9999px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              whiteSpace: 'nowrap',
            }}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={e => onVolumeChange(Number(e.target.value))}
                className="volume-slider"
                style={{ background: volBg }}
              />
            </div>
          )}
          <button
            onClick={() => setShowVolume(v => !v)}
            style={{ ...iconBtn, color: showVolume ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.8)' }}
            title="Volume"
          >
            <SpeakerIcon volume={volume} />
          </button>
        </div>
      </div>
    </div>
  )
}
