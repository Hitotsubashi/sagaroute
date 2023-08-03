import { Dependency } from '@/gather';
import { Imports } from '@/weave';

export default function generateImports(dependencies: Dependency[] | undefined): Imports {
  const imports: Imports = {};
  dependencies?.forEach((dependency) => {
    const { importPath, ...rest } = dependency;
    if (imports[importPath]) {
      imports[importPath].push(rest);
    } else {
      imports[importPath] = [rest];
    }
  });
  return imports;
}
