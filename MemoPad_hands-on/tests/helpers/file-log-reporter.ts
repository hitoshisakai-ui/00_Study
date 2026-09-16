import fs from 'node:fs';
import path from 'node:path';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

type FileLogReporterOptions = {
  stdoutFile?: string;
  stderrFile?: string;
};

class FileLogReporter implements Reporter {
  private stdoutFile: string;
  private stderrFile: string;
  private startedAt = new Date();

  constructor(options: FileLogReporterOptions = {}) {
    this.stdoutFile = options.stdoutFile ?? 'tests/logs/playwright.stdout.log';
    this.stderrFile = options.stderrFile ?? 'tests/logs/playwright.stderr.log';
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.startedAt = new Date();
    this.prepareFile(this.stdoutFile);
    this.prepareFile(this.stderrFile);

    this.appendStdout(`Started: ${this.startedAt.toISOString()}`);
    this.appendStdout(`Config: ${config.configFile}`);
    this.appendStdout(`Workers: ${config.workers}`);
    this.appendStdout(`Total: ${suite.allTests().length} tests`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const title = test.titlePath().slice(1).join(' > ');
    this.appendStdout(`[${result.status.toUpperCase()}] ${title} (${result.duration}ms)`);

    if (result.status !== 'passed') {
      this.appendStderr(`[${result.status.toUpperCase()}] ${title}`);
      for (const error of result.errors) {
        this.appendStderr(error.stack ?? error.message ?? String(error));
      }
    }
  }

  onEnd(result: FullResult) {
    const endedAt = new Date();
    this.appendStdout(`Finished: ${endedAt.toISOString()}`);
    this.appendStdout(`Duration: ${endedAt.getTime() - this.startedAt.getTime()}ms`);
    this.appendStdout(`Status: ${result.status}`);
  }

  private prepareFile(filePath: string) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '', 'utf8');
  }

  private appendStdout(message: string) {
    fs.appendFileSync(this.stdoutFile, `${message}\n`, 'utf8');
  }

  private appendStderr(message: string) {
    fs.appendFileSync(this.stderrFile, `${message}\n`, 'utf8');
  }
}

export default FileLogReporter;
