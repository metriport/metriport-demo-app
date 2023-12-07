import {
  Heading,
  Box,
  Spinner,
  VStack,
  Stack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../shared/api";
import { fetchUserToken } from "../shared/util";

export default function Settings({}: {}) {
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const color = useColorModeValue("white", "gray.700");

  // ensure user token is loaded into the api
  useEffect(() => {
    fetchUserToken()
      .then((token) => {
        setIsLoadingToken(false);
        api.defaults.headers.common["Authorization"] = token;
      })
      .catch((err) => console.log(err));
  }, []);
  return (
    <Box>
      <Heading>Settings</Heading>
      {isLoadingToken ? (
        <Spinner size={"xl"}></Spinner>
      ) : (
        <VStack pt={4} align="stretch">
          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            bg={color}
            rounded={"xl"}
            boxShadow={"lg"}
            p={6}
            my={12}
          >
            <Button
              colorScheme="blue"
              bg="#748df0"
              color="white"
              _hover={{
                bg: "#879ced",
              }}
            >
              Do Something
            </Button>
          </Stack>
        </VStack>
      )}
    </Box>
  );
}
