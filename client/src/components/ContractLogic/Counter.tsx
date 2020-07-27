import MuiTypography from "@material-ui/core/Typography";
import * as React from "react";

import { useAccount, useError, useSdk } from "../../service";
import { Button, useBaseStyles} from "../../theme";

import { FormValues } from "../Form";
import { COUNT_FIELD, ResetForm } from "./ResetForm";
import LinearProgress from '@material-ui/core/LinearProgress';

export interface CounterProps {
  readonly contractAddress: string;
}

export interface State {
  readonly loading: boolean;
  readonly count?: string;
}

interface QueryResponse {
  readonly count: string;
}

export function Counter(props: CounterProps): JSX.Element {
  const classes = useBaseStyles();
  const { contractAddress } = props;
  const { getClient } = useSdk();
  const { setError } = useError();
  const { refreshAccount } = useAccount();

  const [state, setState] = React.useState<State>({ loading: false });

  React.useEffect(() => {
    
    setState({ loading: true });
    getClient()
      .queryContractSmart(contractAddress, { get_count: { } })
      .then(res => {
        setState({ count: res.count, loading: false });
      })
      .catch(err => {
        setState({ loading: false });
        if (!err.toString().includes("Failed to get counter")) {
          setError(err);
        }
      });
  }, [getClient, setError, contractAddress]);

  const increment = async (): Promise<boolean> => {
    
    setState({ loading: true });
    try {
      await getClient().execute(
        props.contractAddress,
        { increment: { } },
      );
      setState({ loading: false });
      refreshAccount();
      
      await getClient().queryContractSmart(contractAddress, { get_count: { } })
      .then(res => {
        setState({ count: res.count, loading: false });
      })
      .catch(err => {
        setState({ loading: false });
        if (!err.toString().includes("Failed to get counter")) {
          setError(err);
        }
      });

    } catch (err) {
      setState({ loading: false });
      setError(err);
    }
    return true;
  };

  const reset = async (values: FormValues): Promise<void> => {
    const newCount = values[COUNT_FIELD];
    setState({ loading: true });
    try {
      await getClient().execute(
        props.contractAddress,
        { reset: { count: parseInt(newCount) } }
      );
      setState({ count: newCount, loading: false });
    } catch (err) {
      setState({ loading: false });
      setError(err);
    }
    try {
      refreshAccount();
    } catch(err) {
      setError("Failed to reset account");
    }
  };

  return (
    <div className={classes.card}>
      <MuiTypography variant="h6">
        
        Counter: {state.loading ? <LinearProgress /> : state.count}
      </MuiTypography>
      <Button color="primary" type="submit" onClick={increment} disabled={state.loading}>
        Increment
      </Button>
      <ResetForm handleReset={reset} loading={state.loading} />
    </div>
  );
}
