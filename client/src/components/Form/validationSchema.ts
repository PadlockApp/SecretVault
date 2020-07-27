import * as Yup from "yup";

export const ResetValidationSchema = Yup.object().shape({
  countField: Yup.number()
    .min(0, "Count invalid")
    .required("Count is required"),
});
