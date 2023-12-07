import { ChakraProvider, theme } from "@chakra-ui/react";
import Navbar from "./components/nav/navbar";
import Settings from "./components/settings/settings";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Amplify from "aws-amplify";
import Home from "./components/home/home";
import Example from "./components/example/example";

Amplify.configure({
  Auth: {
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    region: process.env.REACT_APP_AWS_REGION,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
  },
});

export const App = () => (
  <Authenticator loginMechanisms={["email"]}>
    {({ signOut, user }) => {
      return (
        <main>
          <BrowserRouter>
            <ChakraProvider theme={theme}>
              <Navbar
                children={
                  <Routes>
                    <Route path="/" element={<Home></Home>} />
                    <Route path="example" element={<Example></Example>} />
                    <Route path="settings" element={<Settings></Settings>} />
                  </Routes>
                }
                signOut={signOut}
                user={user}
              />
            </ChakraProvider>
          </BrowserRouter>
        </main>
      );
    }}
  </Authenticator>
);
