import { createStaticStyles } from 'antd-style';

const tagBase = (outlineColor: string, borderRadius: string) => `
  cursor: default;
  user-select: none;
  display: inline-flex;
  margin-inline-end: 4px;

  &.selected {
    border-radius: ${borderRadius};
    outline: 2px solid ${outlineColor};
  }
`;

export const styles = createStaticStyles(({ css, cssVar }) => ({
  commandTag: css`
    ${tagBase('#722ED1', cssVar.borderRadius)}
  `,
  skillTag: css`
    ${tagBase(cssVar.colorPrimary, cssVar.borderRadius)}
  `,
  toolTag: css`
    ${tagBase(cssVar.colorWarning, cssVar.borderRadius)}
  `,
}));
