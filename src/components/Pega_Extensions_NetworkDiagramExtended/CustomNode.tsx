import { useMemo, type MouseEvent } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import styled, { css } from 'styled-components';
import { Link, Icon, registerIcon, Text, StyledText, StyledLink } from '@pega/cosmos-react-core';

const registeredIcons = new Set<string>();

const registerIconByName = async (iconName: string) => {
  if (registeredIcons.has(iconName)) return;

  try {
    const module = await import(
      `@pega/cosmos-react-core/lib/components/Icon/icons/${iconName}.icon`
    );
    registerIcon(module);
    registeredIcons.add(iconName);
  } catch (err) {
    console.warn(`⚠️ Icon "${iconName}" could not be registered. Falling back to default.`);
  }
};


const Node = styled.div(({ theme }: { theme: any }) => {
  return css`
    padding: 0.25rem;
    color: ${theme.base.palette['foreground-color']};
    background: transparent;
    display: flex;
    flex-flow: column;
    align-items: center;
    max-width: 10rem;
    width: 10rem;

    svg {
      height: 3rem;
      width: 3rem;
    }
    ${StyledLink},
    ${StyledText} {
      white-space: normal; /* allow wrapping */
      overflow-wrap: normal; /* don't aggressively break words */
      word-break: normal; /* only break between words */
      text-align: center;
      word-spacing: normal;
    }
    .react-flow__handle.react-flow__handle-top,
    .react-flow__handle.react-flow__handle-bottom {
      background: ${theme.base.palette['primary-background']};
    }
    div.react-flow__handle.connectionindicator {
      pointer-events: none;
      cursor: none;
    }
  `;
});

type RenderNodeProps = {
  key?: string;
  objClass?: string;
  id: string;
  label: string;
  getPConnect?: any;
  theme: any;
  iconName: string;
};

const renderNode = (props: RenderNodeProps) => {
  const { key, objClass, id, label, getPConnect, theme, iconName } = props;

  const resolvedIconName = iconName || 'user';

  registerIconByName(iconName);

  const linkURL = (window as any).PCore.getSemanticUrlUtils().getResolvedSemanticURL(
    (window as any).PCore.getSemanticUrlUtils().getActions().ACTION_OPENWORKBYHANDLE,
    { caseClassName: objClass },
    { workID: id }
  );
  const linkEl =
    objClass && key && linkURL ? (
      <Link
        href={linkURL}
        previewable
        onPreview={() => {
          getPConnect().getActionsApi().showCasePreview(encodeURI(key), {
            caseClassName: objClass
          });
        }}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          /* for links - need to set onClick for spa to avoid full reload - (cmd | ctrl) + click for opening in new tab */
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            getPConnect().getActionsApi().openWorkByHandle(key, objClass);
          }
        }}
      >
        {label}
      </Link>
    ) : (
      <Text>{label}</Text>
    );

  return (
    <Node theme={theme}>
      <Handle type='source' position={Position.Top} id='a' />
      <Icon name={resolvedIconName} />
      {linkEl}
      <Handle type='source' position={Position.Bottom} id='c' />
    </Node>
  );
};

const CustomNode = (props: NodeProps) => {

  return useMemo(() => renderNode(props.data), [props.data]);
};

export default CustomNode;
