import { Controller, Post, UploadedFiles, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FilesService } from './files.service';

class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
class FileUploadResponseDto {
  @ApiProperty({
    description: 'The URLs of the uploaded images.',
    example: ["http://res.cloudinary.com/dc629i0tc/image/upload/v1716484659/wouryifjvm9tiqzowlwq.jpg"]
  })
  imageUrls: string[];
}


@ApiTags('Archivos')

@Controller('files')
export class FilesController {
  constructor(private cloudinary: CloudinaryService, private fileservice:FilesService) {}

  @Post('fotos')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiResponse({ status: 200, type: FileUploadResponseDto, description: 'The image has been successfully uploaded.' })
  @UseInterceptors(FilesInterceptor('files'))
  async uploadUnidadEducativaFotos(
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files were uploaded.');
    }

    const uploadedImages = await this.fileservice.uploadImagesToCloudinary(files);

    // Aquí puedes devolver las URLs de Cloudinary en la respuesta
    return {
      imageUrls: uploadedImages.map(image => image.url),
    };
  }

 
}


