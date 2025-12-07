import { IsString, IsInt, MinLength, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @IsString()
  @MinLength(5, { message: 'Comment text must be at least 5 characters long' })
  @MaxLength(1024, { message: 'Comment text must not exceed 1024 characters' })
  public text!: string;

  @Type(() => Number)
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must not exceed 5' })
  public rating!: number;
}
