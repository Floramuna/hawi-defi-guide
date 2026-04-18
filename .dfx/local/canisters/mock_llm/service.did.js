export const idlFactory = ({ IDL }) => {
  return IDL.Service({ 'ask' : IDL.Func([IDL.Text], [IDL.Text], []) });
};
export const init = ({ IDL }) => { return []; };
