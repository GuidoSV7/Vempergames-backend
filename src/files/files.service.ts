import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class FilesService {
    constructor(private cloudinary: CloudinaryService) {}

    async uploadImagesToCloudinary(files: Array<Express.Multer.File>) {
        const uploadedImages = [];
    
        for (const file of files) {
          try {
            const uploadedImage = await this.cloudinary.uploadImage(file);
            uploadedImages.push(uploadedImage);
          } catch (error) {
            // Si se produce un error al subir una imagen, puedes manejarlo aquí.
            // Puedes optar por omitir la imagen que causó el error o lanzar una excepción, según tu lógica de negocio.
            console.error(`Error uploading image: ${error.message}`);
          }
        }
    
        return uploadedImages;
      }
}
