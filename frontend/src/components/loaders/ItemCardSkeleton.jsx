import { Card, CardContent, Skeleton, Stack } from "@mui/material";

export default function ItemCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Stack spacing={1}>
          <Skeleton width="80%" />
          <Skeleton width="100%" />
          <Skeleton width="60%" />
        </Stack>
      </CardContent>
    </Card>
  );
}
