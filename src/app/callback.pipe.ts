import { PipeTransform, Pipe } from '@angular/core';
import { FormxItem } from './services/forms-service.service';

@Pipe({
    name: 'callback',
    pure: false
})
export class CallbackPipe implements PipeTransform {
    transform(items: FormxItem[], callback: (item: FormxItem) => boolean): FormxItem[] {
        if (!items || !callback) {
            return items;
        }
        return items.filter(item => callback(item));
    }
}
