// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISelfVerificationHub {
    struct VerificationResult {
        bool success;
        uint256 nullifier;
        uint256 userIdentifier;
        string nationality;
        bool ageAbove18;
        uint256 attestationId;
    }

    function verifyProof(
        bytes calldata proof,
        uint256[] calldata publicSignals,
        bytes calldata userContextData
    ) external returns (VerificationResult memory);
}