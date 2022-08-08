import { CompileRequestDto } from 'src/compilers/dto/compile.request.dto';
import { Execution } from './Execution';

export class PythonExecution extends Execution {
  constructor(req: CompileRequestDto) {
    super(req);
  }

  getLanguage(): string {
    return 'python';
  }
}
