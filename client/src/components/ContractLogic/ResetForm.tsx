import { Form, Formik } from "formik";
import * as React from "react";

import { Button } from "../../theme";
import { useBaseStyles } from "../../theme";
import { FormValues } from "../Form";
import { FormTextField } from "../Form/fields/FormTextField";
import { ResetValidationSchema } from "../Form/validationSchema";

export const COUNT_FIELD = "countField";

interface ResetFormProps {
  readonly loading: boolean;
  readonly handleReset: (values: FormValues) => void;
}

export const ResetForm: React.FC<ResetFormProps> = ({ handleReset, loading }: ResetFormProps) => {
  const classes = useBaseStyles();

  return (
    <Formik
      initialValues={{
        countField: "0",
      }}
      validationSchema={ResetValidationSchema}
      onSubmit={async ({ countField }, { setSubmitting }) => {
        setSubmitting(true);
        handleReset({ countField });
      }}
    >
      {({ handleSubmit }) => (
        <Form onSubmit={handleSubmit} className={classes.form}>
          <div className={classes.input}>
            <FormTextField placeholder="0" name={COUNT_FIELD} type="integer" />
          </div>
          <div>
            <Button type="submit" disabled={loading}>
              Reset
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};