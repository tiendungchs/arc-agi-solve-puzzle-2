import { Box, Grid } from "@mui/material";
import { AppContext, type AppContextProps } from "../Context/AppContext";
import { useContext } from "react";
import Example from "../Example";
import type { TrainingData } from "../../types/trainingData";
import Solution from "../Solution";
import Tool from "../Tool";

type LayoutProps = {
  id: keyof TrainingData
}

export default function Layout({ id }: LayoutProps) {
  const { trainingData } = useContext<AppContextProps>(AppContext);
  return (
    <Grid container>
      <Grid size={5}>
        <Example examples={trainingData?.[id].train ?? []} />
      </Grid>
      <Grid size={7}>
        <Box marginBottom={2}>
          <Solution input={trainingData?.[id].test[0].input} />
        </Box>
        <Tool />
      </Grid>
    </Grid>
  );
}
