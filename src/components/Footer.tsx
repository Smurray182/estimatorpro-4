import React from "react";
import { Text } from "@chakra-ui/react";

const Footer: React.FC = () => (
  <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
    &copy; {new Date().getFullYear()} Estimator Pro. All rights reserved.
  </Text>
);

export default Footer;
