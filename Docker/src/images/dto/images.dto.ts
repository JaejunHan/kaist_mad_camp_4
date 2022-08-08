export class ImagesDto {
  imageId: string;
  language: string;

  constructor(imageId, language) {
    this.imageId = imageId;
    this.language = language;
  }
}
