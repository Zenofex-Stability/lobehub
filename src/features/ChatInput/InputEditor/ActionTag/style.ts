import { createStyles } from 'antd-style';

const tagBase = (outlineColor: string, token: any) => `
  cursor: default;
  user-select: none;
  display: inline-flex;

  &.selected {
    border-radius: ${token.borderRadius}px;
    outline: 2px solid ${outlineColor};
  }
`;

export const useStyles = createStyles(({ css, token }) => ({
  commandTag: css`
    ${tagBase('#722ED1', token)}
  `,
  skillTag: css`
    ${tagBase(token.colorPrimary, token)}
  `,
}));

export const actionTagTheme = {
  actionTag: 'editor-action-tag',
};
