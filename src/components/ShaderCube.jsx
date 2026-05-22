import {
  Shader,
  Form3D,
  GridDistortion,
  Plasma,
  Strands,
  StudioBackground,
} from 'shaders/react'

export default function ShaderEffect({ strandsSpeed = 0 }) {
  return (
    <Shader style={{ width: '100%', height: '100%' }}>
      <StudioBackground
        ambientIntensity={12}
        ambientSpeed={1}
        backColor="#2f2f3d"
        backSoftness={52}
        brightness={6}
        center={{
          x: 0.5,
          y: 0.5
        }}
        color="#18181c"
        fillAngle={36}
        fillSoftness={24}
        keyIntensity={36}
        keySoftness={23}
        lightTarget={19}
        seed={62}
        visible={true} />
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
          spinX: -0.14,
          spinY: -0.25,
          spinZ: -0.23
        }}
        shape3dType="box"
        speed={2.5}>
        <Strands
          start={{
            x: 0,
            y: 1
          }}
          visible={false} />
        <Plasma />
        <Strands
          amplitude={2.7}
          frequency={1.7}
          lineCount={18}
          speed={strandsSpeed} />
        <GridDistortion
          visible={true} />
      </Form3D>
    </Shader>
  )
}