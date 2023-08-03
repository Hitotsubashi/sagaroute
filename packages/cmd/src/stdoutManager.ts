import { stdout } from 'single-line-log';
import { green, cyan, blue } from 'colorette';

type StdoutHeader = {
  badge: string;
  message: string;
};

type StdoutContent = {
  progress: number;
  stage: string;
  status: string;
  message: string;
};
class StdoutManager {
  header: StdoutHeader = {
    badge: '',
    message: '',
  };
  content: StdoutContent | undefined = undefined;

  set(header: Partial<StdoutHeader>, content?: Partial<StdoutContent> | undefined) {
    this.header = { ...this.header, ...header };
    if (content === undefined) {
      this.content = undefined;
    } else {
      if (this.content === undefined) {
        this.content = {
          progress: 0,
          stage: '',
          status: '',
          message: '',
        };
      }
      this.content = { ...this.content!, ...content };
    }
    this.output();
  }

  output() {
    const headerLine = `${this.header.badge} ${this.header.message}`;
    const contentLine = this.content
      ? `${green(`${this.content.progress}%`)} ${cyan(this.content.stage)} ${blue(
          this.content.status,
        )} ${this.content.message}`
      : '';
    stdout(headerLine + '\n' + contentLine + '\n');
  }
}

const stdoutManager = new StdoutManager();

export default stdoutManager;
