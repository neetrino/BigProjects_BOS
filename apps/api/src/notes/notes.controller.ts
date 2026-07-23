import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/authenticated-user.type';
import { CreateNoteDto } from './dto/create-note.dto';
import { ListNotesQueryDto } from './dto/list-notes-query.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { NotesService } from './notes.service';

@ApiCookieAuth()
@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  list(@Query() query: ListNotesQueryDto): Promise<NoteResponseDto[]> {
    return this.notesService.list(query);
  }

  @Post()
  create(
    @Body() dto: CreateNoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NoteResponseDto> {
    return this.notesService.create(dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    return this.notesService.remove(id, user);
  }
}
