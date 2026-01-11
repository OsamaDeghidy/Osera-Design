import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Project } from "@prisma/client";

export const useGetPublicProjectById = (id: string) => {
    return useQuery({
        queryKey: ["public-project", id],
        queryFn: async () => {
            const { data } = await axios.get(`/api/view/${id}`);
            return data as Project & { frames: any[] };
        },
        enabled: !!id,
        retry: false, // Don't retry if 404 (Private)
    });
};
