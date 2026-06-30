export type GeneratorType =
  | 'django'
  | 'backend'
  | 'web_app'
  | 'sql'
  | 'supabase'
  | 'sqlalchemy'
  | 'python'
  | 'java'
  | 'pydantic'
  | 'jsonschema'
  | 'smartdata'
  | 'agent'
  | 'qiskit'
  | 'jsonobject'
  | 'pytorch'
  | 'tensorflow'
  | 'alloy';

export type GeneratorMenuMode = 'class' | 'object' | 'user' | 'statemachine' | 'agent' | 'gui' | 'quantum' | 'nn' | 'none';