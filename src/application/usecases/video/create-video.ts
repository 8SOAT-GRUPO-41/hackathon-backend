import { IStorageService } from '@/application/ports/storage'
import { Video } from '@/domain/entities/video'
import { IVideoRepository } from '@/domain/repository/video-repository'

type Input = {
  userId: string
  contentType: string
  expiresIn?: number
}

type Output = {
  video: Video
  uploadUrl: string
}

export class CreateVideo {
  constructor(
    private readonly videoRepository: IVideoRepository,
    private readonly storageService: IStorageService
  ) {}

  async execute(input: Input): Promise<Output> {
    const { userId, contentType, expiresIn } = input
    const videoId = crypto.randomUUID()
    const fileKey = `${userId}/${videoId}`
    const video = new Video(crypto.randomUUID(), userId, fileKey)
    await this.videoRepository.save(video)
    const uploadUrl = await this.storageService.getUploadPresignedUrl({
      fileKey,
      contentType,
      expiresIn,
    })
    return {
      video,
      uploadUrl,
    }
  }
}
