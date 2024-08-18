import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      fetch("http://localhost:8080/login/google").then((response) =>
        response.json(),
      ),
  });

  return <main className=""></main>;
}
