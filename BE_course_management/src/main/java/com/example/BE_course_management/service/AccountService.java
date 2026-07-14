package com.example.BE_course_management.service;

import com.example.BE_course_management.dto.request.AccountCreateRequest;
import com.example.BE_course_management.dto.request.AccountUpdatePasswordRequest;
import com.example.BE_course_management.dto.request.AccountUpdateStatusRequest;
import com.example.BE_course_management.dto.response.AccountResponse;
import com.example.BE_course_management.entity.Account;
import com.example.BE_course_management.entity.AccountStatus;
import com.example.BE_course_management.entity.Roles;
import com.example.BE_course_management.exception.AppException;
import com.example.BE_course_management.exception.ErrorCode;
import com.example.BE_course_management.mapper.AccountMapper;
import com.example.BE_course_management.repository.AccountRepository;
import com.example.BE_course_management.repository.RoleRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountService {

    AccountRepository accountRepository;
    AccountMapper accountMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;

    @Transactional
    public AccountResponse createStudentAccount(AccountCreateRequest request) {
        if(accountRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.ACCOUNT_EXISTED);
        }
        Account account = accountMapper.toAccount(request);
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setStatus(AccountStatus.ACTIVE);
        account.setRole(roleRepository.findByRoleName(Roles.STUDENT.name()).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND)));
        return accountMapper.toAccountResponse(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse createTeacherAccount(AccountCreateRequest request) {
        if(accountRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.ACCOUNT_EXISTED);
        }
        Account account = accountMapper.toAccount(request);
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setStatus(AccountStatus.ACTIVE);
        account.setRole(roleRepository.findByRoleName(Roles.TEACHER.name()).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND)));
        return accountMapper.toAccountResponse(accountRepository.save(account));
    }

    public AccountResponse readAccount(String id) {
        Account account = accountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        return accountMapper.toAccountResponse(account);
    }

    public List<AccountResponse> readAccounts() {
        List<Account> accounts = accountRepository.findAll();
        return accountMapper.toAccountResponseList(accounts);
    }

    @Transactional
    public AccountResponse updatePasswordAccount(String id, AccountUpdatePasswordRequest request) {
        Account account = accountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        if(!passwordEncoder.matches(request.getCurrentPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        return accountMapper.toAccountResponse(accountRepository.save(account));
    }

    @Transactional
    public AccountResponse updateStatusAccount(String id, AccountUpdateStatusRequest request) {
        Account account = accountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
        accountMapper.updateStatusAccount(account, request);
        return accountMapper.toAccountResponse(accountRepository.save(account));
    }

}
