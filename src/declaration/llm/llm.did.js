export const idlFactory = ({ IDL }) => {
  const Config = IDL.Record({
    'max_tokens': IDL.Nat64,
    'temperature': IDL.Float64,
    'top_p': IDL.Opt(IDL.Float64),
    'frequency_penalty': IDL.Opt(IDL.Float64),
    'presence_penalty': IDL.Opt(IDL.Float64),
    'stop': IDL.Opt(IDL.Text),
  });
  
  const Usage = IDL.Record({
    'prompt_tokens': IDL.Nat64,
    'completion_tokens': IDL.Nat64,
    'total_tokens': IDL.Nat64,
  });
  
  const Response = IDL.Record({
    'text': IDL.Text,
    'usage': Usage,
    'finish_reason': IDL.Text,
  });
  
  const StreamResponse = IDL.Record({
    'text': IDL.Text,
    'finished': IDL.Bool,
  });
  
  const Embedding = IDL.Record({
    'embedding': IDL.Vec(IDL.Float64),
    'usage': IDL.Record({
      'prompt_tokens': IDL.Nat64,
      'total_tokens': IDL.Nat64,
    }),
  });
  
  const ModelInfo = IDL.Record({
    'name': IDL.Text,
    'max_context_length': IDL.Nat64,
    'supports_streaming': IDL.Bool,
    'supports_embeddings': IDL.Bool,
  });
  
  return IDL.Service({
    'chat': IDL.Func([IDL.Text, IDL.Opt(Config)], [Response], []),
    'stream': IDL.Func([IDL.Text, IDL.Opt(Config)], [StreamResponse], []),
    'embed': IDL.Func([IDL.Text], [Embedding], []),
    'get_model_info': IDL.Func([], [ModelInfo], ['query']),
    'health_check': IDL.Func([], [IDL.Text], ['query']),
  });
};

export const init = ({ IDL }) => {
  return [];
};