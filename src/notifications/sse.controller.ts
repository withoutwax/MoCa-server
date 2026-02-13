import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Observable, fromEvent, map } from 'rxjs';

@Controller('notifications')
export class SseController {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'ocr.completed').pipe(
      map(
        (data: any) =>
          ({
            data: {
              type: 'OCR_COMPLETE',
              cardId: data.cardId,
              data: data.data,
            },
          }) as MessageEvent,
      ),
    );
  }
}
