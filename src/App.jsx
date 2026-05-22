import { useRef, useState } from 'react'
import ShaderCube from './components/ShaderCube'
import MusicPlayer from './components/MusicPlayer'

export default function App() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackName, setTrackName] = useState(null)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  function handleFileLoad(file) {
    if (audioRef.current) {
      audioRef.current.pause()
      URL.revokeObjectURL(audioRef.current.src)
    }
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.onended = () => setIsPlaying(false)
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime)
    audio.ondurationchange = () => setDuration(isFinite(audio.duration) ? audio.duration : 0)
    audio.volume = volume
    audioRef.current = audio
    setTrackName(file.name.replace(/\.[^.]+$/, ''))
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
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
      audio.play()
      setIsPlaying(true)
    }
  }

  function handleSeek(time) {
    if (audioRef.current) audioRef.current.currentTime = time
    setCurrentTime(time)
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
        onFileLoad={handleFileLoad}
        onPlayPause={handlePlayPause}
        onVolumeChange={handleVolumeChange}
        onSeek={handleSeek}
      />
    </div>
  )
}
