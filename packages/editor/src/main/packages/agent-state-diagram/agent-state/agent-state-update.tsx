import React, { Component, ComponentClass } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import styled from 'styled-components';
import { Button } from '../../../components/controls/button/button';
import { ColorButton } from '../../../components/controls/color-button/color-button';
import { Divider } from '../../../components/controls/divider/divider';
import { TrashIcon } from '../../../components/controls/icon/trash';
import { Textfield } from '../../../components/controls/textfield/textfield';
import { Header } from '../../../components/controls/typography/typography';
import { I18nContext } from '../../../components/i18n/i18n-context';
import { localized } from '../../../components/i18n/localized';
import { ModelState } from '../../../components/store/model-state';
import { StylePane } from '../../../components/style-pane/style-pane';
import { UMLElement } from '../../../services/uml-element/uml-element';
import { UMLElementRepository } from '../../../services/uml-element/uml-element-repository';
import { AsyncDispatch } from '../../../utils/actions/actions';
import { notEmpty } from '../../../utils/not-empty';
import { AgentElementType } from '..';
import { AgentStateBody } from '../agent-state-body/agent-state-body';
import { AgentStateFallbackBody } from '../agent-state-fallback-body/agent-state-fallback-body';
import { AgentState } from './agent-state';
import { AgentStateMember } from '../agent-state/agent-state-member';

import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/python/python';
import { Dropdown } from '../../../components/controls/dropdown/dropdown';
import { LayouterRepository } from '../../../services/layouter/layouter-repository';

// ─── Styled components ────────────────────────────────────────────────────────

const Flex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
`;

const Section = styled.section`
  padding: 8px 0;
`;

const SectionHeader = styled.span`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.6;
  margin-bottom: 4px;
  display: block;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0;
`;

const DbFieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;

  & + & {
    border-top: 1px solid ${(props: any) => props.theme.color.gray}22;
  }
`;

const ResizableCodeMirrorWrapper = styled.div`
  resize: both;
  overflow: auto;
  min-height: 150px;
  border: 1px solid ${(props) => props.theme.color.gray};
  border-radius: 4px;
  padding: 8px;
  box-sizing: border-box;

  .CodeMirror {
    height: 100% !important;
    width: 100%;
  }
`;

const LlmSelect = styled.select`
  width: 100%;
  height: 30px;
  padding: 0 6px;
  border: 1px solid ${(props) => props.theme.color.gray};
  border-radius: 4px;
  background: transparent;
  color: inherit;
`;

const LlmFieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
`;

/* Body-type toggle */
const BodyTypeRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
`;

const BodyTypeBtn = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.color.gray}88;
  background: ${(props) => (props.active ? props.theme.color.primary : 'transparent')};
  color: ${(props) => (props.active ? '#fff' : 'inherit')};
  cursor: pointer;
  font-size: 12px;
  &:hover:not(:disabled) {
    opacity: 0.85;
  }
`;

/* Action card */
const ActionCard = styled.div`
  border: 1px solid ${(props: any) => props.theme.color.gray}44;
  border-radius: 4px;
  margin-bottom: 6px;
  background: transparent;
  transition: border-color 0.15s;
  &[data-drag-over='true'] {
    border-color: ${(props: any) => props.theme.color.primary};
    background: ${(props: any) => props.theme.color.primary}11;
  }
  &[data-dragging='true'] {
    opacity: 0.4;
  }
`;

const ActionCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 6px;
  cursor: default;
`;

const DragHandle = styled.span`
  cursor: grab;
  opacity: 0.4;
  font-size: 14px;
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
  &:hover {
    opacity: 0.9;
  }
  &:active {
    cursor: grabbing;
  }
`;

const ActionTypeBadge = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  background: ${(props: any) => props.theme.color.gray}22;
  padding: 2px 5px;
  border-radius: 3px;
  letter-spacing: 0.4px;
  flex-shrink: 0;
`;

const ActionSummary = styled.span`
  flex: 1;
  font-size: 12px;
  opacity: 0.75;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  opacity: 0.55;
  font-size: 13px;
  line-height: 1;
  flex-shrink: 0;
  &:hover {
    opacity: 1;
  }
`;

const ActionBody = styled.div`
  padding: 0 8px 8px 8px;
  border-top: 1px solid ${(props: any) => props.theme.color.gray}22;
`;

const AddActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  padding: 2px 0;
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface OwnProps {
  element: AgentState;
}

type StateProps = {
  elements: ModelState['elements'];
};

interface DispatchProps {
  create: typeof UMLElementRepository.create;
  update: typeof UMLElementRepository.update;
  remove: typeof UMLElementRepository.delete;
  getById: (id: string) => UMLElement | null;
  layout: typeof LayouterRepository.layout;
}

type Props = OwnProps & StateProps & DispatchProps & I18nContext;

type DbReplyValues = {
  dbSelectionType: string;
  dbCustomName: string;
  dbQueryMode: string;
  dbOperation: string;
  dbSqlQuery: string;
};

interface State {
  colorOpen: boolean;
  newBodyActionType: string;
  newFallbackActionType: string;
  expandedBodyIds: Set<string>;
  expandedFallbackIds: Set<string>;
  draggingIndex: number | null;
  draggingPrefix: string | null;
  dragOverIndex: number | null;
  dragOverPrefix: string | null;
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  text: 'Text Reply',
  llm: 'LLM Reply',
  llm_chat: 'LLM Chat',
  rag: 'RAG Reply',
  db_reply: 'DB Action',
  code: 'Python Code',
};

const enhance = compose<ComponentClass<OwnProps>>(
  localized,
  connect<StateProps, DispatchProps, OwnProps, ModelState>(
    (state) => ({ elements: state.elements }),
    {
      create: UMLElementRepository.create,
      update: UMLElementRepository.update,
      remove: UMLElementRepository.delete,
      getById: UMLElementRepository.getById as any as AsyncDispatch<typeof UMLElementRepository.getById>,
      layout: LayouterRepository.layout,
    },
  ),
);

class StateUpdate extends Component<Props, State> {
  state: State = {
    colorOpen: false,
    newBodyActionType: 'text',
    newFallbackActionType: 'text',
    expandedBodyIds: new Set(),
    expandedFallbackIds: new Set(),
    draggingIndex: null,
    draggingPrefix: null,
    dragOverIndex: null,
    dragOverPrefix: null,
  };

  private layoutTimer: ReturnType<typeof setTimeout> | null = null;

  componentWillUnmount() {
    if (this.layoutTimer) clearTimeout(this.layoutTimer);
  }

  private scheduleLayout = () => {
    if (this.layoutTimer) clearTimeout(this.layoutTimer);
    this.layoutTimer = setTimeout(() => {
      this.props.layout();
      this.layoutTimer = null;
    }, 300);
  };

  private toggleColor = () => this.setState((s) => ({ colorOpen: !s.colorOpen }));

  render() {
    const { element, getById, elements } = this.props;
    const children = element.ownedElements.map((id) => getById(id)).filter(notEmpty);
    const bodies = children.filter((c): c is AgentStateMember => c instanceof AgentStateBody);
    const fallbackBodies = children.filter((c): c is AgentStateMember => c instanceof AgentStateFallbackBody);

    const ragDatabaseNames = Array.from(
      new Set(
        Object.values(elements)
          .filter((el: any) => el.type === AgentElementType.AgentRagElement && typeof el.name === 'string')
          .map((el: any) => el.name.trim())
          .filter((n) => n.length > 0),
      ),
    );
    const AGENT_LLM_TYPE = (AgentElementType as Record<string, string>).AgentLLM ?? 'AgentLLM';
    const llmEntries = Array.from(
      new Map(
        Object.values(elements)
          .filter((el: any) => el.type === AGENT_LLM_TYPE && typeof el.name === 'string')
          .map((el: any) => {
            const name = String(el.name).trim();
            return [name, { name, provider: String((el as any).provider || '').toLowerCase() } as const];
          })
          .filter(([name]) => name.length > 0),
      ).values(),
    );
    const llmNames = llmEntries.map((entry) => entry.name);
    const llmProviderByName = llmEntries.reduce<Record<string, string>>((acc, entry) => {
      acc[entry.name] = entry.provider;
      return acc;
    }, {});
    const hasCompatibleChatLlm = llmEntries.some((entry) => this.isChatCompatibleProvider(entry.provider));

    const stateType = element.stateType ?? 'standard';
    const fallbackEnabled = element.fallbackBodyEnabled !== false;

    return (
      <div>
        {/* Name / color / delete */}
        <Section>
          <Flex>
            <Textfield value={element.name} onChange={this.rename(element.id)} autoFocus />
            <ColorButton onClick={this.toggleColor} />
            <Button color="link" tabIndex={-1} onClick={this.delete(element.id)}>
              <TrashIcon />
            </Button>
          </Flex>
          <StylePane
            open={this.state.colorOpen}
            element={element}
            onColorChange={this.props.update}
            fillColor
            lineColor
            textColor
          />
          <Divider />
        </Section>

        {/* State type selector */}
        <Section>
          <SectionHeader>State Type</SectionHeader>
          <Dropdown
            value={stateType}
            onChange={(value) => this.props.update<AgentState>(element.id, { stateType: value } as any)}
          >
            {[
              <Dropdown.Item key="standard" value="standard">Standard</Dropdown.Item>,
              <Dropdown.Item key="reasoning" value="reasoning">Reasoning</Dropdown.Item>,
            ]}
          </Dropdown>
        </Section>

        {/* Reasoning config */}
        {stateType === 'reasoning' && this.renderReasoningConfig(element, llmNames)}

        {/* Body / fallback — standard only */}
        {stateType === 'standard' && (
          <>
            <Section><Divider /></Section>
            <Section>
              <SectionHeader>Body</SectionHeader>
              {this.renderBodySection(
                bodies,
                AgentStateBody,
                ragDatabaseNames,
                llmNames,
                llmProviderByName,
                hasCompatibleChatLlm,
                'body',
              )}
            </Section>

            <Section><Divider /></Section>
            <Section>
              <ToggleLabel>
                <input
                  type="checkbox"
                  checked={fallbackEnabled}
                  onChange={(e) => {
                    this.props.update<AgentState>(element.id, { fallbackBodyEnabled: e.target.checked } as any);
                    if (!e.target.checked) fallbackBodies.forEach((fb) => this.delete(fb.id)());
                  }}
                />
                Enable Fallback Body
              </ToggleLabel>
              {fallbackEnabled && (
                <>
                  <SectionHeader style={{ marginTop: 8 }}>Fallback Body</SectionHeader>
                   {this.renderBodySection(
                     fallbackBodies,
                     AgentStateFallbackBody,
                     ragDatabaseNames,
                     llmNames,
                     llmProviderByName,
                     hasCompatibleChatLlm,
                     'fallback',
                   )}
                </>
              )}
            </Section>
          </>
        )}
      </div>
    );
  }

  // ─── Reasoning config ────────────────────────────────────────────────────────

  private renderReasoningConfig = (element: AgentState, llmNames: string[]) => (
    <>
      <Section><Divider /></Section>
      <Section>
        <Header>LLM name</Header>
        <LlmSelect
          value={element.llm_name || ''}
          onChange={(e) => this.props.update<AgentState>(element.id, { llm_name: e.target.value } as any)}
        >
          <option value="">(use default)</option>
          {llmNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </LlmSelect>
      </Section>
      <Section>
        <Header>Max steps</Header>
        <Textfield
          value={element.max_steps ?? 8}
          onChange={(value) => {
            const parsed = parseInt(String(value), 10);
            this.props.update<AgentState>(element.id, { max_steps: Number.isNaN(parsed) ? 8 : parsed } as any);
          }}
        />
      </Section>
      <Section>
        <CheckboxRow>
          <input type="checkbox" checked={element.enable_task_planning !== false}
            onChange={(e) => this.props.update<AgentState>(element.id, { enable_task_planning: e.target.checked } as any)} />
          Enable task planning
        </CheckboxRow>
        <CheckboxRow>
          <input type="checkbox" checked={element.stream_steps !== false}
            onChange={(e) => this.props.update<AgentState>(element.id, { stream_steps: e.target.checked } as any)} />
          Stream steps
        </CheckboxRow>
      </Section>
      <Section>
        <Header>System prompt</Header>
        <Textfield value={element.system_prompt || ''} multiline enterToSubmit={false}
          placeholder="Optional system prompt prefix for this state"
          onChange={(system_prompt) => this.props.update<AgentState>(element.id, { system_prompt } as any)} />
      </Section>
      <Section>
        <Header>Fallback message</Header>
        <Textfield value={element.fallback_message || ''} multiline enterToSubmit={false}
          placeholder="Message returned if the reasoning loop fails"
          onChange={(fallback_message) => this.props.update<AgentState>(element.id, { fallback_message } as any)} />
      </Section>
    </>
  );

  // ─── Body section (predefined / custom toggle + action list) ─────────────────

  private renderBodySection = (
    actions: AgentStateMember[],
    Clazz: typeof AgentStateBody | typeof AgentStateFallbackBody,
    ragDatabaseNames: string[],
    llmNames: string[],
    llmProviderByName: Record<string, string>,
    hasCompatibleChatLlm: boolean,
    prefix: 'body' | 'fallback',
  ) => {
    const isCustom = actions.some((a) => a.replyType === 'code');
    const bodyType = isCustom ? 'custom' : 'predefined';

    return (
      <>
        <BodyTypeRow>
          <BodyTypeBtn
            active={bodyType === 'predefined'}
            onClick={() => {
              if (bodyType !== 'predefined') this.switchBodyType('predefined', actions, Clazz);
            }}
          >
            Predefined
          </BodyTypeBtn>
          <BodyTypeBtn
            active={bodyType === 'custom'}
            onClick={() => {
              if (bodyType !== 'custom') this.switchBodyType('custom', actions, Clazz);
            }}
          >
            Custom (Python)
          </BodyTypeBtn>
        </BodyTypeRow>

        {bodyType === 'custom'
          ? this.renderCustomBody(actions, Clazz)
          : this.renderPredefinedBody(
            actions,
            Clazz,
            ragDatabaseNames,
            llmNames,
            llmProviderByName,
            hasCompatibleChatLlm,
            prefix,
          )}
      </>
    );
  };

  private renderCustomBody = (
    actions: AgentStateMember[],
    Clazz: typeof AgentStateBody | typeof AgentStateFallbackBody,
  ) => {
    const codeAction = actions.find((a) => a.replyType === 'code');
    if (!codeAction) {
      return (
        <Button color="primary" onClick={() =>
          this.create(Clazz, 'code')('def body_name(session: \'Session\'):\n\n\n\n\n')
        }>
          Initialize Python code
        </Button>
      );
    }
    return (
      <ResizableCodeMirrorWrapper>
        <CodeMirror
          value={codeAction.name}
          options={{ mode: 'python', theme: 'material', lineNumbers: true, tabSize: 4, indentWithTabs: true }}
          onBeforeChange={(_e, _d, value) => { this.props.update(codeAction.id, { name: value }); this.scheduleLayout(); }}
          onChange={(_e, _d, value) => { if (value.trim()) this.props.update(codeAction.id, { name: value }); }}
        />
      </ResizableCodeMirrorWrapper>
    );
  };

  private renderPredefinedBody = (
    actions: AgentStateMember[],
    Clazz: typeof AgentStateBody | typeof AgentStateFallbackBody,
    ragDatabaseNames: string[],
    llmNames: string[],
    llmProviderByName: Record<string, string>,
    hasCompatibleChatLlm: boolean,
    prefix: 'body' | 'fallback',
  ) => {
    const newActionType = prefix === 'body' ? this.state.newBodyActionType : this.state.newFallbackActionType;
    const availableActionTypes = hasCompatibleChatLlm
      ? ['text', 'llm', 'llm_chat', 'rag', 'db_reply']
      : ['text', 'llm', 'rag', 'db_reply'];
    const selectedActionType = availableActionTypes.includes(newActionType) ? newActionType : 'text';
    const setNewActionType = (v: string) =>
      prefix === 'body'
        ? this.setState({ newBodyActionType: v })
        : this.setState({ newFallbackActionType: v });

    const expandedIds = prefix === 'body' ? this.state.expandedBodyIds : this.state.expandedFallbackIds;

    return (
      <>
        {actions.map((action, index) => {
          const isExpanded = expandedIds.has(action.id);
          const isDraggingOver =
            this.state.dragOverIndex === index && this.state.dragOverPrefix === prefix;
          const isDragging =
            this.state.draggingIndex === index && this.state.draggingPrefix === prefix;

          return (
            <ActionCard
              key={action.id}
              draggable
              data-drag-over={isDraggingOver ? 'true' : 'false'}
              data-dragging={isDragging ? 'true' : 'false'}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', String(index));
                e.dataTransfer.effectAllowed = 'move';
                this.setState({ draggingIndex: index, draggingPrefix: prefix });
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (this.state.dragOverIndex !== index || this.state.dragOverPrefix !== prefix) {
                  this.setState({ dragOverIndex: index, dragOverPrefix: prefix });
                }
              }}
              onDragLeave={() => {
                this.setState({ dragOverIndex: null, dragOverPrefix: null });
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                if (!Number.isNaN(fromIndex) && fromIndex !== index) {
                  this.swapActions(actions, fromIndex, index);
                }
                this.setState({ draggingIndex: null, draggingPrefix: null, dragOverIndex: null, dragOverPrefix: null });
              }}
              onDragEnd={() => {
                this.setState({ draggingIndex: null, draggingPrefix: null, dragOverIndex: null, dragOverPrefix: null });
              }}
            >
              <ActionCardHeader>
                <DragHandle title="Drag to reorder">⠿</DragHandle>
                <ActionTypeBadge>{ACTION_TYPE_LABELS[action.replyType] ?? action.replyType}</ActionTypeBadge>
                <ActionSummary title={action.name}>{this.getActionSummary(action)}</ActionSummary>
                <IconBtn title={isExpanded ? 'Collapse' : 'Expand'} onClick={() => this.toggleExpand(action.id, prefix)}>
                  {isExpanded ? '▲' : '✎'}
                </IconBtn>
                <IconBtn title="Delete action" onClick={this.delete(action.id)}>
                  <TrashIcon />
                </IconBtn>
              </ActionCardHeader>
              {isExpanded && (
                <ActionBody>
                  {this.renderActionEditor(
                    action,
                    Clazz,
                    ragDatabaseNames,
                    llmNames,
                    llmProviderByName,
                    `${prefix}-${index}`,
                  )}
                </ActionBody>
              )}
            </ActionCard>
          );
        })}

        <AddActionRow>
          <Dropdown value={selectedActionType} onChange={setNewActionType}>
            {[
              <Dropdown.Item key="text" value="text">Text Reply</Dropdown.Item>,
              <Dropdown.Item key="llm" value="llm">LLM Reply</Dropdown.Item>,
              ...(hasCompatibleChatLlm
                ? [<Dropdown.Item key="llm_chat" value="llm_chat">LLM Chat</Dropdown.Item>]
                : []),
              <Dropdown.Item key="rag" value="rag">RAG Reply</Dropdown.Item>,
              <Dropdown.Item key="db_reply" value="db_reply">DB Action</Dropdown.Item>,
            ]}
          </Dropdown>
          <Button color="primary" onClick={() => {
            if (selectedActionType === 'llm_chat' && !hasCompatibleChatLlm) {
              return;
            }
            const id = this.addPredefinedAction(Clazz, selectedActionType);
            // Auto-expand newly added action
            if (id) {
              const key = prefix === 'body' ? 'expandedBodyIds' : 'expandedFallbackIds';
              const next = new Set(this.state[key]);
              next.add(id);
              this.setState({ [key]: next } as any);
            }
          }}>
            Add
          </Button>
        </AddActionRow>
        {!hasCompatibleChatLlm && (
          <p style={{ fontSize: 12, margin: '4px 0', opacity: 0.7 }}>
            LLM Chat is available when at least one Agent LLM uses OpenAI or Hugging Face.
          </p>
        )}
      </>
    );
  };

  // ─── Action editor (inline, shown when expanded) ──────────────────────────────

  private renderActionEditor = (
    action: AgentStateMember,
    Clazz: typeof AgentStateBody | typeof AgentStateFallbackBody,
    ragDatabaseNames: string[],
    llmNames: string[],
    llmProviderByName: Record<string, string>,
    fieldId: string,
  ): React.ReactNode => {
    switch (action.replyType) {
      case 'text':
        return (
          <Textfield
            outline
            value={action.name}
            onChange={(value) => this.props.update(action.id, { name: value })}
            placeholder="Enter reply message"
          />
        );
      case 'llm':
        return this.renderLlmNameField(action, llmNames, `${fieldId}-llm`);
      case 'llm_chat': {
        const selectedProvider = action.llm_name ? llmProviderByName[action.llm_name] : '';
        const hasIncompatibleSelection = Boolean(
          action.llm_name && selectedProvider && !this.isChatCompatibleProvider(selectedProvider),
        );
        return this.renderLlmNameField(action, llmNames, `${fieldId}-llm-chat`, {
          warning: hasIncompatibleSelection
            ? 'Selected LLM provider is incompatible with chat(). Use OpenAI or Hugging Face.'
            : undefined,
        });
      }
      case 'rag':
        return ragDatabaseNames.length ? (
          <LlmFieldRow>
            <Header>RAG database</Header>
            <Dropdown
              value={action.ragDatabaseName && action.ragDatabaseName.length > 0 ? action.ragDatabaseName : '__placeholder__'}
              onChange={(value) => {
                const selected = value === '__placeholder__' ? '' : value;
                this.props.update<AgentStateMember>(action.id, {
                  ragDatabaseName: selected,
                  name: this.getRagDisplayName(selected),
                });
              }}
            >
              {[
                <Dropdown.Item value="__placeholder__" key="rag-placeholder">Select RAG database</Dropdown.Item>,
                ...ragDatabaseNames.map((name, i) => (
                  <Dropdown.Item key={`rag-${i}-${name}`} value={name}>{name}</Dropdown.Item>
                )),
              ]}
            </Dropdown>
            <Header style={{ marginTop: 6 }}>Prompt</Header>
            <Textfield
              outline
              multiline
              enterToSubmit={false}
              value={action.prompt || ''}
              onChange={(value) => this.props.update<AgentStateMember>(action.id, { prompt: value })}
              placeholder="Optional prompt passed to RAGReply(prompt=...)"
            />
          </LlmFieldRow>
        ) : (
          <p style={{ fontSize: 12, margin: '4px 0', opacity: 0.7 }}>
            No RAG databases found. Create one from the palette first.
          </p>
        );
      case 'db_reply':
        return this.renderDbReplyEditor(action, Clazz, llmNames);
      default:
        return null;
    }
  };

  // ─── Summary text for collapsed action cards ─────────────────────────────────

  private getActionSummary = (action: AgentStateMember): string => {
    const name = action.name || '';
    const truncate = (s: string, n = 40) => s.length > n ? s.slice(0, n) + '…' : s;
    switch (action.replyType) {
      case 'llm':
        return action.llm_name ? `LLM: ${action.llm_name}` : '(default LLM)';
      case 'llm_chat':
        return action.llm_name ? `Chat: ${action.llm_name}` : '(default LLM chat)';
      case 'rag':
        return action.ragDatabaseName
          ? `DB: ${action.ragDatabaseName}${action.prompt ? ' (prompt)' : ''}`
          : '(select database)';
      default:
        return truncate(name);
    }
  };

  // ─── Body type switch ─────────────────────────────────────────────────────────

  private switchBodyType = (
    type: 'predefined' | 'custom',
    actions: AgentStateMember[],
    Clazz: typeof AgentStateBody | typeof AgentStateFallbackBody,
  ) => {
    actions.forEach((a) => this.delete(a.id)());
    if (type === 'custom') {
      this.create(Clazz, 'code')('def body_name(session: \'Session\'):\n\n\n\n\n');
    }
  };

  // ─── Add predefined action (returns a stable reference for auto-expand) ───────

  private addPredefinedAction = (
    Clazz: typeof AgentStateBody | typeof AgentStateFallbackBody,
    replyType: string,
  ): string | null => {
    const member = new Clazz();
    member.replyType = replyType;
    switch (replyType) {
      case 'text':
        member.name = 'Enter reply message';
        break;
      case 'llm':
        member.name = 'LLM Reply';
        break;
      case 'llm_chat':
        member.name = 'LLM Chat Reply';
        break;
      case 'rag': {
        member.ragDatabaseName = '';
        member.prompt = '';
        member.name = this.getRagDisplayName('');
        break;
      }
      case 'db_reply': {
        const defaults = this.getDefaultDbReplyValues();
        Object.assign(member, defaults);
        member.name = this.getDbDisplayName(
          defaults.dbSelectionType, defaults.dbCustomName, defaults.dbQueryMode, defaults.dbOperation,
        );
        break;
      }
      default:
        member.name = replyType;
    }
    this.props.create(member, this.props.element.id);
    return member.id;
  };

  // ─── Expand / collapse ────────────────────────────────────────────────────────

  private toggleExpand = (id: string, prefix: 'body' | 'fallback') => {
    const key = prefix === 'body' ? 'expandedBodyIds' : 'expandedFallbackIds';
    const current: Set<string> = this.state[key];
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.setState({ [key]: next } as any);
  };

  // ─── Swap (drag-and-drop backing) ─────────────────────────────────────────────

  private swapActions = (actions: AgentStateMember[], indexA: number, indexB: number) => {
    const a = actions[indexA];
    const b = actions[indexB];
    const fieldsOf = (m: AgentStateMember) => ({
      name: m.name,
      replyType: m.replyType,
      ragDatabaseName: m.ragDatabaseName,
      prompt: m.prompt,
      dbSelectionType: m.dbSelectionType,
      dbCustomName: m.dbCustomName,
      dbQueryMode: m.dbQueryMode,
      dbOperation: m.dbOperation,
      dbSqlQuery: m.dbSqlQuery,
      llm_name: m.llm_name,
      system_message: m.system_message,
    });
    this.props.update<AgentStateMember>(a.id, fieldsOf(b));
    this.props.update<AgentStateMember>(b.id, fieldsOf(a));
  };

  // ─── Helper renderers ─────────────────────────────────────────────────────────

  private renderLlmNameField = (
    member: AgentStateMember,
    llmNames: string[],
    fieldId: string,
    options?: { warning?: string },
  ) => (
    this.renderLlmNameFieldWithOptions(member, llmNames, fieldId, options)
  );

  private renderLlmNameFieldWithOptions = (
    member: AgentStateMember,
    llmNames: string[],
    fieldId: string,
    options?: { warning?: string },
  ) => (
    <LlmFieldRow>
      <Header>LLM</Header>
      <LlmSelect
        id={fieldId}
        value={member.llm_name || ''}
        onChange={(e) => this.props.update<AgentStateMember>(member.id, { llm_name: e.target.value })}
      >
        <option value="">(use default)</option>
        {llmNames.map((n) => <option key={`${fieldId}-${n}`} value={n}>{n}</option>)}
      </LlmSelect>
      {options?.warning && (
        <p style={{ fontSize: 12, margin: '4px 0', opacity: 0.7 }}>
          {options.warning}
        </p>
      )}
      <Header style={{ marginTop: 6 }}>System message</Header>
      <Textfield
        outline
        value={member.system_message || ''}
        onChange={(value) => this.props.update<AgentStateMember>(member.id, { system_message: value })}
        placeholder="You are a helpful assistant."
      />
    </LlmFieldRow>
  );

  private isChatCompatibleProvider = (provider: string): boolean => provider === 'openai' || provider === 'huggingface';

  private renderDbReplyEditor = (
    member: AgentStateMember | undefined,
    Clazz: typeof AgentStateBody | typeof AgentStateFallbackBody,
    llmNames: string[] = [],
  ) => {
    if (!member) {
      return (
        <>
          <p>Configuring database action...</p>
          <Button color="primary" onClick={() => {
            const defaults = this.getDefaultDbReplyValues();
            this.create(Clazz, 'db_reply', defaults)(
              this.getDbDisplayName(defaults.dbSelectionType, defaults.dbCustomName, defaults.dbQueryMode, defaults.dbOperation),
            );
          }}>
            Initialize database action
          </Button>
        </>
      );
    }

    const dbSelectionType = member.dbSelectionType || 'default';
    const dbQueryMode = member.dbQueryMode || 'llm_query';
    const dbOperation = member.dbOperation || 'any';

    return (
      <>
        <DbFieldRow>
          <label>Select a Database</label>
          <Dropdown value={dbSelectionType} onChange={(value) => {
            const next = value === 'custom' ? 'custom' : 'default';
            this.updateDbReply(member, { dbSelectionType: next, dbCustomName: next === 'default' ? '' : member.dbCustomName });
          }}>
            {[
              <Dropdown.Item value="default" key="db-default">Default (using the app DB)</Dropdown.Item>,
              <Dropdown.Item value="custom" key="db-custom">Custom</Dropdown.Item>,
            ]}
          </Dropdown>
          {dbSelectionType === 'custom' && (
            <Textfield outline placeholder="Custom database name" value={member.dbCustomName || ''}
              onChange={(value) => this.updateDbReply(member, { dbCustomName: value })} />
          )}
        </DbFieldRow>
        <DbFieldRow>
          <label>DB operation</label>
          <Dropdown value={dbOperation} onChange={(value) => {
            const ops = ['any', 'select', 'insert', 'update', 'delete'];
            this.updateDbReply(member, { dbOperation: ops.includes(value) ? value : 'any' });
          }}>
            {[
              <Dropdown.Item value="any" key="op-any">Any</Dropdown.Item>,
              <Dropdown.Item value="select" key="op-select">SELECT</Dropdown.Item>,
              <Dropdown.Item value="insert" key="op-insert">INSERT</Dropdown.Item>,
              <Dropdown.Item value="update" key="op-update">UPDATE</Dropdown.Item>,
              <Dropdown.Item value="delete" key="op-delete">DELETE</Dropdown.Item>,
            ]}
          </Dropdown>
        </DbFieldRow>
        <DbFieldRow>
          <RadioGroup>
            <label>
              <input type="radio" name={`dbQueryMode-${member.id}`} value="llm_query"
                checked={dbQueryMode === 'llm_query'}
                onChange={() => this.updateDbReply(member, { dbQueryMode: 'llm_query', dbSqlQuery: '' })} />
              LLM query
            </label>
            <label>
              <input type="radio" name={`dbQueryMode-${member.id}`} value="sql"
                checked={dbQueryMode === 'sql'}
                onChange={() => this.updateDbReply(member, { dbQueryMode: 'sql' })} />
              SQL
            </label>
          </RadioGroup>
          {dbQueryMode === 'sql' ? (
            <Textfield outline multiline enterToSubmit={false} placeholder="SELECT * FROM table_name"
              value={member.dbSqlQuery || ''}
              onChange={(value) => this.updateDbReply(member, { dbSqlQuery: value })} />
          ) : (
            <>
              <p>Answer will be generated with LLM during runtime</p>
              {this.renderLlmNameField(member, llmNames, `db-llm-${member.id}`)}
            </>
          )}
        </DbFieldRow>
      </>
    );
  };

  // ─── Utility helpers ──────────────────────────────────────────────────────────

  private getRagDisplayName = (databaseName: string): string => {
    const trimmed = (databaseName || '').trim();
    return trimmed.length ? `RAG reply using ${trimmed} database` : 'RAG reply (select database)';
  };

  private getDefaultDbReplyValues = (): DbReplyValues => ({
    dbSelectionType: 'default', dbCustomName: '', dbQueryMode: 'llm_query', dbOperation: 'any', dbSqlQuery: '',
  });

  private getDbDisplayName = (dbSelectionType: string, dbCustomName: string, dbQueryMode: string, dbOperation: string): string => {
    const customDb = (dbCustomName || '').trim();
    const dbLabel = dbSelectionType === 'custom' ? (customDb.length ? customDb : 'custom database') : 'Default database';
    const modeLabel = dbQueryMode === 'sql' ? 'SQL' : 'LLM query';
    const opLabel = dbOperation === 'any' ? 'Any' : dbOperation.toUpperCase();
    return `DB action using ${dbLabel} (${modeLabel}, ${opLabel})`;
  };

  private updateDbReply = (member: AgentStateMember, values: Partial<AgentStateMember>) => {
    const dbSelectionType = values.dbSelectionType ?? member.dbSelectionType ?? 'default';
    const dbCustomName = values.dbCustomName ?? member.dbCustomName ?? '';
    const dbQueryMode = values.dbQueryMode ?? member.dbQueryMode ?? 'llm_query';
    const dbOperation = values.dbOperation ?? member.dbOperation ?? 'any';
    this.props.update<AgentStateMember>(member.id, {
      ...values,
      name: this.getDbDisplayName(dbSelectionType, dbCustomName, dbQueryMode, dbOperation),
    });
  };

  private create = (
    Clazz: typeof AgentStateBody | typeof AgentStateFallbackBody,
    replyType: string,
    initialValues?: Partial<AgentStateMember>,
  ) => (value: string) => {
    const member = new Clazz();
    member.name = value;
    member.replyType = replyType;
    if (initialValues) Object.assign(member, initialValues);
    this.props.create(member, this.props.element.id);
  };

  private rename = (id: string) => (value: string) => this.props.update(id, { name: value });

  private delete = (id: string) => () => this.props.remove(id);
}

export const AgentStateUpdate = enhance(StateUpdate);
