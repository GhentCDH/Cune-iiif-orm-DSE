import { type Vault } from '@iiif/helpers'
import { type IIIFExternalWebResource, type ImageService } from '@iiif/presentation-3'

export type ThumbnailOptions = {
  width?: number
  height?: number
  maxWidth?: number
  maxHeight?: number
}

export const useImageHelper = (vault: Vault) => {
  const getImageResource = (imageId: string): IIIFExternalWebResource | null => {
    const image = vault.getObject(imageId)
    if (!image || image.type !== 'Image') return null
    return image as IIIFExternalWebResource
  }

  const getImageService = (image: IIIFExternalWebResource | string): ImageService | null => {
    if (!image) return null
    const imageResource = typeof image === 'string' ? getImageResource(image) : image
    if (!imageResource || typeof imageResource !== 'object' || !('service' in imageResource))
      return null

    // Check for IIIF Image Service (v2 or v3)
    const service = imageResource.service?.find(
      (s) => 'type' in s && (s.type === 'ImageService2' || s.type === 'ImageService3')
    )
    return (service as ImageService) || null
  }

  const createImageThumbnail = (
    image: IIIFExternalWebResource | string,
    opts: ThumbnailOptions = {}
  ): string | null => {
    if (!image) return null

    const imageResource = typeof image === 'string' ? getImageResource(image) : image
    if (!imageResource) {
      return null
    }

    // get image service
    const service = getImageService(imageResource)
    if (!service || !service?.id) {
      return imageResource.id || null
    }

    // Build IIIF Image API URL
    const { width, height, maxWidth = 200, maxHeight = 200 } = opts
    const baseUrl = service.id.replace(/\/$/, '') // Remove trailing slash

    // Determine size parameter
    let sizeParam = 'max' // todo: check!
    if (width && height) {
      sizeParam = `${width},${height}`
    } else if (width) {
      sizeParam = `${width},`
    } else if (height) {
      sizeParam = `,${height}`
    } else {
      sizeParam = `!${maxWidth},${maxHeight}` // todo: is this correct?
    }

    // IIIF Image API URL: {scheme}://{server}{/prefix}/{identifier}/{region}/{size}/{rotation}/{quality}.{format}
    return `${baseUrl}/full/${sizeParam}/0/default.jpg`
  }

  return {
    createImageThumbnail,
    getImageService,
    getImageResource
  }
}
