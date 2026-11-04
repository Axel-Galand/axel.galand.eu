import sharp from 'sharp'

/** A 4000x3000 JPEG carrying GPS coordinates, like a phone photo. */
export const phonePhoto = () =>
  sharp({ create: { width: 4000, height: 3000, channels: 3, background: '#4a7' } })
    .jpeg()
    .withExif({
      IFD0: { Make: 'TestPhone' },
      IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '44/1 50/1 0/1' },
    })
    .toBuffer()
