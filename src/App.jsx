import { useRef, useState } from 'react'
import ShaderCube from './components/ShaderCube'
import MusicPlayer from './components/MusicPlayer'
import Bookshelf from './components/Bookshelf'

export default function App() {
  const audioRef = useRef(null)
  const progressKeyRef = useRef(null)
  const lastSaveRef = useRef(0)
  const [showLibrary, setShowLibrary] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackName, setTrackName] = useState(null)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioError, setAudioError] = useState(null)

  function loadAudio(url, name, storageKey) {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    progressKeyRef.current = storageKey || null
    lastSaveRef.current = 0
    setAudioError(null)

    const audio = new Audio(url)
    audio.volume = volume

    audio.onerror = async () => {
      let msg = 'Failed to load audio'
      try {
        const r = await fetch(url, { headers: { Range: 'bytes=0-0' } })
        if (!r.ok) {
          if (r.status === 404) msg = `HTTP 404 — proxy endpoint not found (routing broken)`
          else if (r.status === 403) msg = `HTTP 403 — access denied (file not publicly shared on Drive)`
          else if (r.status === 502) msg = `HTTP 502 — proxy failed to reach Google Drive`
          else msg = `HTTP ${r.status} error from proxy`
        } else {
          msg = 'Audio failed to decode (unsupported format?)'
        }
      } catch (e) {
        msg = `Network error: ${e.message}`
      }
      setAudioError(msg)
      setIsPlaying(false)
    }

    audio.onloadedmetadata = () => {
      if (storageKey) {
        const saved = localStorage.getItem(`book_pos_${storageKey}`)
        if (saved) audio.currentTime = parseFloat(saved)
      }
    }
    audio.ondurationchange = () => setDuration(isFinite(audio.duration) ? audio.duration : 0)
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime)
      if (progressKeyRef.current && audio.currentTime - lastSaveRef.current > 5) {
        lastSaveRef.current = audio.currentTime
        localStorage.setItem(`book_pos_${progressKeyRef.current}`, audio.currentTime)
      }
    }
    audio.onended = () => {
      setIsPlaying(false)
      if (progressKeyRef.current) localStorage.removeItem(`book_pos_${progressKeyRef.current}`)
    }

    audioRef.current = audio
    setTrackName(name)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }

  function handleFileLoad(file) {
    loadAudio(URL.createObjectURL(file), file.name.replace(/\.[^.]+$/, ''), null)
  }

  function handleBookSelect(book) {
    if (!book.driveId) return
    const url = `/api/drive-proxy/${book.driveId}`
    loadAudio(url, book.title, book.driveId)
    setShowLibrary(false)
  }

  function handleVolumeChange(v) {
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  function handlePlayPause() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => setIsPlaying(false))
      setIsPlaying(true)
    }
  }

  function handleSeek(time) {
    if (audioRef.current) audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  function handleSkip(seconds) {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds))
    setCurrentTime(audio.currentTime)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100dvh' }}>
      <ShaderCube strandsSpeed={isPlaying ? 0.5 : 0} />
      <MusicPlayer
        isPlaying={isPlaying}
        trackName={trackName}
        volume={volume}
        currentTime={currentTime}
        duration={duration}
        error={audioError}
        onFileLoad={handleFileLoad}
        onPlayPause={handlePlayPause}
        onVolumeChange={handleVolumeChange}
        onSeek={handleSeek}
        onSkip={handleSkip}
        onOpenLibrary={() => setShowLibrary(true)}
      />
      {showLibrary && (
        <Bookshelf onSelect={handleBookSelect} onClose={() => setShowLibrary(false)} />
      )}
    </div>
  )
}
