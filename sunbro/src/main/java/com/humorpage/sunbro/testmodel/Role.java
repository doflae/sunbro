/*
package com.humorpage.sunbro.testmodel;
import org.hibernate.annotations.NaturalId;

import javax.persistence.*;

@Entity
@Table(name="roles")
public class Role{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING) //열거형
    @NaturalId
    @Column(length = 60)
    private TestRoleName testRoleName;

    public Role() {

    }

    public Role(TestRoleName testRoleName) {
        this.testRoleName = testRoleName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TestRoleName getName() {
        return testRoleName;
    }

    public void setName(TestRoleName testRoleName) {
        this.testRoleName = testRoleName;
    }
}*/
