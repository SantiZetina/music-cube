import {
  Shader,
  Form3D,
  Plasma,
  Strands,
} from 'shaders/react'

export default function ShaderEffect({ strandsSpeed = 0, isPlaying = false }) {
  const spin = isPlaying ? { spinX: -0.14, spinY: -0.25, spinZ: -0.23 } : { spinX: 0, spinY: 0, spinZ: 0 }

  return (
    <Shader style={{ width: '100%', height: '100%' }}>
      <Form3D
        center={{
          x: 0.5,
          y: 0.4
        }}
        shape3d={{
          type: "box",
          sizeX: 100,
          sizeY: 100,
          sizeZ: 100,
          rounding: 41,
          rotX: -4,
          rotY: -13,
          rotZ: -7,
          ...spin
        }}
        shape3dType="box"
        speed={2.5}>
        <Plasma />
        <Strands
          amplitude={2.7}
          frequency={1.7}
          lineCount={8}
          speed={strandsSpeed} />
      </Form3D>
    </Shader>
  )
}