import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Textfield } from '../../../components/controls/textfield/textfield';
import { Header } from '../../../components/controls/typography/typography';
import { ModelState } from '../../../components/store/model-state';
import { UMLElementRepository } from '../../../services/uml-element/uml-element-repository';
import { AgentElementType } from '..';
import { AgentTool } from './agent-tool';

const Section = styled.section`
  padding: 8px 0;
`;

const Warning = styled.p`
  font-size: 12px;
  margin: 4px 0 8px;
  color: #e04040;
  opacity: 0.85;
`;

type OwnProps = {
  element: AgentTool;
};

type StateProps = {
  elements: ModelState['elements'];
};

type DispatchProps = {
  update: typeof UMLElementRepository.update;
};

type Props = OwnProps & StateProps & DispatchProps;

const AGENT_STATE_TYPE = (AgentElementType as Record<string, string>).AgentState ?? 'AgentState';

const AgentToolUpdateComponent: React.FC<Props> = ({ element, update, elements }) => {
  const hasReasoningState = Object.values(elements).some(
    (el: any) => el.type === AGENT_STATE_TYPE && el.stateType === 'reasoning',
  );

  return (
    <div>
      {!hasReasoningState && (
        <Warning>
          ⚠ Tools can only be used by a reasoning state. Add a reasoning state to use this tool.
        </Warning>
      )}
      <Section>
        <Header>Tool name</Header>
        <Textfield value={element.name} onChange={(name) => update<AgentTool>(element.id, { name })} autoFocus />
      </Section>
      <Section>
        <Header>Description</Header>
        <Textfield
          value={element.description}
          multiline
          enterToSubmit={false}
          placeholder="Short description shown to the LLM"
          onChange={(description) => update<AgentTool>(element.id, { description })}
        />
      </Section>
      <Section>
        <Header>Python code</Header>
        <Textfield
          value={element.code}
          multiline
          enterToSubmit={false}
          placeholder={'def tool_name(...):\n    ...'}
          onChange={(code) => update<AgentTool>(element.id, { code })}
        />
      </Section>
    </div>
  );
};

const enhance = connect<StateProps, DispatchProps, OwnProps, ModelState>(
  (state) => ({ elements: state.elements }),
  { update: UMLElementRepository.update },
);

export const AgentToolUpdate = enhance(AgentToolUpdateComponent);
