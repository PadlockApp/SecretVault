import * as React from "react";

import { useError, useSdk } from "../../service";
import { useBaseStyles } from "../../theme";
import { Counter } from "./Counter";

export interface ContractDetailsProps {
  readonly address: string;
  readonly name?: string;
}

type State = ContractDetailsProps;

const emptyInfo: State = {
  address: ""
};

function ContractLogic({ address, name }: ContractDetailsProps): JSX.Element {
  const classes = useBaseStyles();
  const { getClient } = useSdk();
  const { setError } = useError();

  // eslint-disable-next-line
  const [value, setValue] = React.useState<State>(emptyInfo);

  // get the contracts
  React.useEffect(() => {
    getClient()
      .getContract(address)
      .then(info => setValue({ ...info, address }))
      .catch(setError);
  }, [setError, address, getClient]);

  return (
    <div className={classes.contractLogicContainer}>
      <Counter contractAddress={address} />
    </div>
  );
}

export default ContractLogic;
