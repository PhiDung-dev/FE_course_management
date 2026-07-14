package com.example.BE_course_management.mapper;

import com.example.BE_course_management.dto.request.AccountCreateRequest;
import com.example.BE_course_management.dto.request.AccountUpdateStatusRequest;
import com.example.BE_course_management.dto.response.AccountResponse;
import com.example.BE_course_management.entity.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface AccountMapper {

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "role", ignore = true)
    Account toAccount(AccountCreateRequest request);

    AccountResponse toAccountResponse(Account account);

    List<AccountResponse> toAccountResponseList(List<Account> accounts);

    void updateStatusAccount(@MappingTarget Account account, AccountUpdateStatusRequest request);

}
