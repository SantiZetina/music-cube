import {
  Shader,
  Form3D,
  FractalNoise,
  FilmGrain,
} from 'shaders/react'

// PS1 Polygon Era — experimental sandbox
export default function ShaderCubeExperimental({ isPlaying = false }) {
  const spin = isPlaying ? { spinX: -0.14, spinY: -0.25, spinZ: -0.23 } : { spinX: 0, spinY: 0, spinZ: 0 }

  return (
    <Shader style={{ width: '100%', height: '100%' }}>
      <Form3D
        center={{ x: 0.5, y: 0.4 }}
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
        <FractalNoise
          colorA="#0a0f1a"
          colorB="#1a3a2a"
          octaves={4}
          contrast={0.75}
          speed={0.06}
        />
        <FilmGrain
          strength={0.12}
          bias={4}
          animated={true}
        />
      </Form3D>
    </Shader>
  )
}
