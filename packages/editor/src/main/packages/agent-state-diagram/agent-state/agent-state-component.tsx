import React, { FunctionComponent } from 'react';
import { Text } from '../../../components/controls/text/text';
import { AgentState } from './agent-state';
import { ThemedRect, ThemedPath } from '../../../components/theme/themedComponents';

interface Props {
  element: AgentState;
  children?: React.ReactNode;
  fillColor?: string;
}

const REASONING_ACCENT = '#7C3AED';

export const AgentStateComponent: FunctionComponent<Props> = ({ element, children, fillColor }) => {
  const cornerRadius = 8;

  if (element.stateType === 'reasoning') {
    const headerHeight = 50;
    const llmLabel = element.llm_name ? `LLM: ${element.llm_name}` : 'LLM: (use default)';
    const accent = element.strokeColor || REASONING_ACCENT;
    const textColor = element.textColor || 'currentColor';

    return (
      <g>
        <ThemedRect
          fillColor={fillColor || element.fillColor}
          strokeColor="none"
          width="100%"
          height={element.bounds.height}
          rx={cornerRadius}
        />
        <svg height={headerHeight} width="100%" style={{ overflow: 'hidden' }}>
          <Text fill={textColor}>
            <tspan x="50%" dy={-6} textAnchor="middle" fontSize="80%" fontWeight="bold" fill={accent}>
              {'🧠 «reasoning»'}
            </tspan>
            <tspan x="50%" dy={20} textAnchor="middle" fontWeight="bold">
              {element.name}
            </tspan>
          </Text>
        </svg>
        <svg
          x={0}
          y={headerHeight}
          height={element.bounds.height - headerHeight}
          width="100%"
          style={{ overflow: 'hidden' }}
        >
          <Text fill={textColor} fontWeight="normal" fontSize="80%">
            {llmLabel}
          </Text>
        </svg>

        <ThemedRect
          width="100%"
          height="100%"
          strokeColor={accent}
          fillColor="none"
          pointer-events="none"
          rx={cornerRadius}
        />
        <ThemedPath d={`M 0 ${headerHeight} H ${element.bounds.width}`} strokeColor={accent} />
      </g>
    );
  }

  return (
    <g>
      <ThemedRect
        fillColor={fillColor || element.fillColor}
        strokeColor="none"
        width="100%"
        height={element.stereotype ? 50 : 40}
        rx={cornerRadius}
      />
      <ThemedRect
        y={element.stereotype ? 50 : 40}
        width="100%"
        height={element.bounds.height - (element.stereotype ? 50 : 40)}
        strokeColor="none"
        rx={cornerRadius}
      />
      {element.stereotype ? (
        <svg height={50} width="100%" style={{ overflow: 'hidden' }}>
          <Text fill={element.textColor}>
            <tspan x="50%" dy={-8} textAnchor="middle" fontSize="85%">
              {`«${element.stereotype}»`}
            </tspan>
            <tspan
              x="50%"
              dy={18}
              textAnchor="middle"
              fontStyle={element.italic ? 'italic' : undefined}
              textDecoration={element.underline ? 'underline' : undefined}
            >
              {element.name}
            </tspan>
          </Text>
        </svg>
      ) : (
        <>
        <svg height={40} width="100%" style={{ overflow: 'hidden' }}>
          <Text
            fill={element.textColor}
            fontStyle={element.italic ? 'italic' : undefined}
            textDecoration={element.underline ? 'underline' : undefined}
          >
            {element.name}
          </Text>
        </svg>
        <image
          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABZCAYAAAC+PDOsAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAABgmSURBVHhe7Z0JfF1Vncfv8rK/9/JeQpsmeUlomrZQ9k0WAT+KGyCKgKK4oI7gLoij6DgqqzCDojOInaqoA46CsjgzRRFUFkGwHWhBG9qStuRla1qaNlvT5r1373x/992ErM3LUpJH+X16e+8959x7/+d3/+d37r0xjSxGWVnZ/NzcwNsNw303p4eZpvnteLzlRxy7XoE5BNvfZx0qKiqqAgH7M3D6WQg+2TDMUtc1FhUXB5u7uno2+MXmDLKS6JqasoNN077SNN1Pm6YRcl3zWQhfA+GvJ/vwUCj8Ynd3d0O69NxAVhF93HHH5di2vQxivwipn0SDe9DkByD8FrY/UOQEzpexrw2Hi//e1dXV4l04B5A1RC9dWhrauXP36RB5GSRfjAY3k3ybbRsr4vHWx8LhiEhPoOHHs8XY8iH7ccjuS99hdpEVRFdWVsYSCfujhmFdAoFnoclbIPo7+flFt27Z0tioMiK0qKhoq2UZYTT+FJJKOe7o7Oxew/Gsd45ZQXQkEjwRbf0+mrxYJEPgjU1Nrf/R0dGx1y/ioaenp7OoKPgi+RWy15StQ6vpHLvW+0VmDZa/n9OwLPMliFvrn+5yHFNexZha2tbWtt6y3Bsg+XG0/1DTdP6pqqrqeD971pAVRKdS1nrHMf4d8jATLuS5l+PeLfGzh6Guri6M9ldw2KFzzEjQdZNVOp5NZIXpoOkno9HoLtd1Cjg9Be2ej7a6kUj0mc7Ozj3pUoYRi8Uqk8n+iyH3UvLfTFKcl7LctnPvG1puNpA1XgdE9USjRW00wmpOMQVmDA3fwUt4RvnyrdNun6EApg5d3kTyTaFQZEVDQ0OvyswmsoZoAdIiEHgSRB4FoVGS6ogEW4qLo0lMCwGM+SnIp07mc+Td3Nzc+qPt27envItnGVkz1lFWVlaUk5PzfsNwbuEUbTU7IPs0iK1n/yRp/8C2g3MCF+fO5ua23+i6uYKsIRpf+kgIvYnDGFp9LWYigXdxI1XATHhoYvuJaaZ+FY9vrU8nzR1khdfhQ9HeGewbMAl35uYmHofkn3K+3XXdzWz/kkw6/zoXSRayhWgT7VV/sgcvYqsStmzZ1m5ZyV9AMFru3gD5P8CH3q281zBF1NTU5FdVVX44FqvYFIuVyxZnHbJFo/PZSlHsTrT3hXRSdmEuu3emPI1QKFQRCKRKXNc6DJI1wL+psLBoWzAYjJBXzJbT09Mz503GnPQ6NHti28bZuGrzEJFw2lXLO9h359aR9n/pkkTYrtGN//xUOBy+v76+vt9Pn3OYc0RXVVVVuG5K0d1lnBamUyfEBjj/ZlNT613++ZzDnCO6urriDHzku9DUXDyMp9k/62eNA3Mhmv5Oyj0YDvefX1+/vcfPeA37AoHJ2XgYLor9N47P9JPHxZDyq2Kx2Al+8pzDTGu0hX2NBgLmUY5j1hIK51qWGfDzMoLjuFo2cCmmoAFN/Tki7vSzxsTL5Y1taPVvLcvQjMqUgMwORr+f+21PJBJr2tvbNV2WTOdODzNCNH7uglQq9SaaehmCzue2p5F8BFs+ZOV4hTLHUJkymYIaWYfpTFs5bHt4YRDsPsLxC5ixLoh/trm5eZVXYoqYFtHquAwj9RYE06jae7ldJckaLdtJ2kb2Gn/IMrhB/juErQqCc9l3k/ZntF2DVM+1tLT8lf2kMVWi7Zqa8sWplPlJhLmI84MQpgVy/8QtX4L0bSjHM4mEK7KzCrZtR6jT8abpLKE+xdRnGfU5lSw6WfdxthVNTW0rOZ/U8OukiVY4bBiJYxzH+BSXfwhT0UbyQwiwOpFwfoVdg+RXB+hcC6jfSdj9D0D6sRB+DPvnUaLr0PDft7a27vCLTohJRYYiGVt8IodXQvIFCLGZt//d/v7kd9va2h/uBemSrw5oCq27u/vFaLTkMddNNlLnQsg+hT0a73aXl1c+v2PHjoyCpMkQbRUVFdHDG19jOwuS16PFNzU3ty5/tRE8Ippv7OrqWR+JFD0HyZUo10kkL00m+1/q6uqewM9PI2Oi6fhqIfjLbHR6RgO98fUtLa3/mc49MNDZ2bMdsv+GzolsLdKpi0TCjZ2d3RMOdGVEdG1tbbHjJC+E5K9go5Sy/B00+Sd+9gEFkR0MhjZgt5eg3SfAx7yCgsIHJ2rVGQ2T4rwvxky8H3OhgffHm5paf+xnHZAoLCykQzR+CCd7Ub5DcnLs96RzxseEGq0VnD09XafSVC7jDW40TfsWOomMp4uWLVuWW1Rkx0Kh6InFxaHX09QWB4PhnPz8/N7du3e/kqNtdm1t2bzCwsjhkUhkISbgoFAospe6THoRZEdHRyoaDaYwnzE4ORmy6Ti77yRr3GBpQvcO27zIdZ1/5mYX00xWNje3nEuyIqh9waqsrFyE9r9VfSjP18DPcaTX0Cq6OV7LvZ5jT9hs1RN1PZa+bOaBHDF84rehKPKJNeSqZb15kKRApJ70do57LMtaG4/Hn05flRFs7n0uJuRu7rOK/ScbG1vHDf8zILqcyM+8G4FU9o6mppbPpHPGRnqY0307JMvJ/yDbQAiulyMnX/fxxz9ctMkktHV/ZpqBVVR0xiZW/WGBM5DjZOT5YJpoDwNyyGx6LZqX3snuUbLuRI5Hm7CNSp8I1dUVbyae+DX3RrvdH9FvfdXPGoUJTUcoVHyoZZkfRZw42ncHTY1ed2xotRAPvoJXcgWnWs0ph/63XKtF4k8h0F/Yr0Ko1ZTZDMnzOD+SPS/FPai4ONiBGxUnbVooLy+vtiznczznH3mmZs77eN4jyIMsnhxPcqwXvEpycL6A/evYFCMUIYfcuQnlwAQGufYIriN6NHdgPsYdD59QozUMSbNYiWB/tiz7I2gdBI2GSE6lAlfy0E9wKrv3LBW917IC97TNFq/QEGidHBr0Lsq/mXufyV577TFKdheRLqteZRMryu5NlZ42OlyKMTW0dXkZXVe9oTsOsNuY9ZNGI/n1+8yRiBNXc+ZYWm3f3Y2RL6c2sXOkD2EIyLUZpIckBScx5NbqNABjxBxNGYbvmcKPVkuE1NlCBXRZRiMNQ9wBiK+7Bl6L5VVY2toPVlGrHSJEq+kkPYi7MZ+a5Pou9QL6BpXQyVQK+oBbE0W8+lVZRl2XR8oJdh9rZA5i9AIhJJZ8aELFaGjZZ5zROzVMW3A5y52+hj3jH0MQIoHuQ6Y4jNP4ZLFSdxTsrPJByboA1JLjXqiP1K8mxBmhIUqx7etpbhH0d2oFbcb0M36FBCBqcBTd9M5HZ/cVqSw+W/QnJVwE8dpwQ4bN3lXzfEAl6PGfkdF2rOT0qBqlm7xM44bAYRfm8WSMR1jEIpHWkJBaE7b1VxRTJBJpBi/IYs4lO1fW5j4nFXTwfq2BW8cGN+DGqnUNuoTsXJzWmqVy5XoZSMi5x7IpnGLiDd5aFnrNjC2m3oq00XfSliG1t0+Rq6TuPVV5nEJeH3YBDRZXvjlPvxnrDgBzpS8FJ42R/gFf4D/p4kL6yEKVOE5OkqxQ0RNdRXNmQFYdO3oHv5VnGcH1+Lj6HJIQEFXqGpCCWWf8l0Yb2r5X58MxOAFl5dK17bPIWVYOB2hVxYxLNJnGQnIiKVg8MEKKJKkJByedO2cEm1d1R50Dh/NF4UhBnCE9BYeQ2PYU+cJLQCK9E/HWQJ7T0Nl1l08hKVEtk3H0R1V2pYcg/xhbKTjkmSSO0EoHPT98WrBpRCJQAJVJlpQVHG3nU7QKH34TkQGFZBEFSQUbVKqiWqmT/Qx+VMl8LHLdL3lJH2GjDpGjE9E9GVZ/u0Y3VmJGHOOCfwT45V4dVJ4tz5aOHwI8XBRliAeJgFlUTBcVe9dYqVg3zZ6VoWZE/N0hVw2nHWi0uy0hGcqXVd0Tic9v1v3IhDipJELFvE4lqaWL9lI7kWolb52pxvobcV5YJq6HqPF8bBtRKpAKJgAAAABJRU5ErkJggg=="
          x={element.bounds.width - 35}
          y={2}
          width="35"
          height="35"
        />
        </>
      )}

      {children}

      <ThemedRect
        width="100%"
        height="100%"
        strokeColor={element.strokeColor}
        fillColor="none"
        pointer-events="none"
        rx={cornerRadius}
      />
      {element.hasBody && (
        <ThemedPath d={`M 0 ${element.headerHeight} H ${element.bounds.width}`} strokeColor={element.strokeColor} />
      )}
      {element.hasBody && (
         <svg
         xmlns="http://www.w3.org/2000/svg"
         width="40"
         height="40"
         viewBox="0 0 16 16"
         x="70%"
         y="40"
       >

       </svg>
      )}
      {element.hasFallbackBody && (
        <ThemedPath d={`M 0 ${element.dividerPosition} H ${element.bounds.width}`} strokeColor={element.strokeColor} />
      )}
    </g>
  );
};
