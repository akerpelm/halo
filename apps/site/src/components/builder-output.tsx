import { CodeBlock } from './code-block';
import { Segmented } from './segmented';

export type BuilderOutputKind = 'code' | 'prompt';

type BuilderOutputProps = {
  output: BuilderOutputKind;
  onOutput: (output: BuilderOutputKind) => void;
  code: string;
  prompt: string;
  file: string;
};

export function BuilderOutput({ output, onOutput, code, prompt, file }: BuilderOutputProps) {
  return (
    <div className="grid gap-5 max-lg:p-5">
      <Segmented
        label="Output"
        hideLabel
        value={output}
        onChange={onOutput}
        options={[
          { value: 'code', label: 'Code' },
          { value: 'prompt', label: 'Agent prompt' },
        ]}
      />
      <CodeBlock
        className="-mx-5 -mb-5 rounded-none bg-transparent shadow-[inset_0_1px_0_var(--line)]"
        code={output === 'code' ? code : prompt}
        label={output === 'code' ? file : 'prompt.md'}
        copyLabel={output === 'code' ? 'Copy code' : 'Copy prompt'}
        wrap={output === 'prompt'}
      />
    </div>
  );
}
