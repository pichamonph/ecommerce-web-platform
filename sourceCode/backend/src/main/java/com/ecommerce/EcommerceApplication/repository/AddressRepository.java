package com.ecommerce.EcommerceApplication.repository;

import com.ecommerce.EcommerceApplication.model.Address;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUser_IdOrderByIdAsc(Long userId);

    long countByUser_Id(Long userId);

    Optional<Address> findByIdAndUser_Id(Long id, Long userId);

    Optional<Address> findFirstByUser_IdAndIsDefaultTrue(Long userId);

    Optional<Address> findFirstByUser_IdOrderByIdAsc(Long userId);

    @Modifying
    @Query("update Address a set a.isDefault=false where a.user.id=:uid and a.id<>:exceptId")
    void clearDefaultForUserExcept(@Param("uid") Long userId, @Param("exceptId") Long exceptId);

}
